// (C) 2007-2019 GoodData Corporation

import flatMap from "lodash/flatMap";
import unionBy from "lodash/unionBy";
import isObject from "lodash/isObject";
import { defFingerprint, idRef } from "@gooddata/sdk-model";
import * as fs from "fs";
import * as path from "path";
import { WorkspaceType } from "../../../src";
import { storeDirectoryForWorkspace } from "../store";
import { readJsonSync, writeAsJsonSync } from "../utils";
import { DataViewRequests, RecordingFiles } from "@gooddata/mock-handling";
import { mountDashboard } from "../../_infra/renderDashboard";
import { DashboardScenario, getDashboardScenarios } from "./dashboardScenarioFactory";
import { DashboardInteraction } from "../../_infra/backendWithDashboardCapturing";

function storeDataCaptureRequests(dashboardInteraction: DashboardInteraction, recordingDir: string): void {
    const requestsFile = path.join(recordingDir, RecordingFiles.Execution.Requests);
    const { dataViewRequests } = dashboardInteraction;

    let requests: DataViewRequests = {
        allData: false,
        windows: [],
    };

    if (fs.existsSync(requestsFile)) {
        try {
            const existingRequests = readJsonSync(requestsFile);

            if (!isObject(existingRequests)) {
                // eslint-disable-next-line no-console
                console.warn(
                    `The requests file ${requestsFile} seems invalid. It should contain object describing what data view requests should be captured for the recording.`,
                );
            } else {
                requests = existingRequests as DataViewRequests;
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn("Unable to read or parse exec requests file in ", requestsFile);
        }
    }

    if (dataViewRequests.allData) {
        requests.allData = true;
    }

    if (dataViewRequests.windows) {
        requests.windows = unionBy(dataViewRequests.windows, requests.windows, (val) => {
            return `${val.offset.join(",")}-${val.size.join(",")}`;
        });
    }

    writeAsJsonSync(requestsFile, requests);
}

function storeInteraction(dashboardInteraction: DashboardInteraction, workspace: WorkspaceType): void {
    const storeDir = storeDirectoryForWorkspace(workspace, "executions");
    if (!storeDir) {
        return;
    }

    let { triggeredExecution } = dashboardInteraction;
    const fp = defFingerprint(triggeredExecution!);
    const recordingDir = path.join(storeDir, fp);

    if (!fs.existsSync(recordingDir)) {
        fs.mkdirSync(recordingDir);
    }

    if (triggeredExecution?.postProcessing) {
        triggeredExecution = {
            ...triggeredExecution,
            postProcessing: undefined,
        };
    }

    writeAsJsonSync(path.join(recordingDir, RecordingFiles.Execution.Definition), {
        ...triggeredExecution,
        buckets: [],
    });

    storeDataCaptureRequests(dashboardInteraction, recordingDir);
}

describe("dashboardView", () => {
    const allScenarios = getDashboardScenarios();
    if (!allScenarios) {
        return;
    }

    type Scenario = [DashboardScenario, WorkspaceType];
    const Scenarios: Scenario[] = flatMap(Object.keys(allScenarios), (key): Scenario[] => {
        return allScenarios[key].map((s: DashboardScenario) => [s, key]);
    });

    it.each(Scenarios)("should load %p from %s", async (scenario, workspace) => {
        const interactions = await mountDashboard(idRef(scenario.identifier, "analyticalDashboard"));

        expect(interactions.interactions).toBeDefined();

        Object.keys(interactions.interactions).forEach((fingerprint) => {
            const interaction = interactions.interactions[fingerprint];

            storeInteraction(interaction, workspace);
        });
    });
});
