// (C) 2021 GoodData Corporation
import process from "process";
import path from "path";
import fs from "fs";

import { WorkspaceType } from "../../src";
import { StoreEnvVar } from "./constants";

export type DashboardScenario = {
    identifier: string;
};

type DashboardScenarios = { [E in WorkspaceType]: DashboardScenario[] };

function detectDashboards(rootDir: string, workspaceType: WorkspaceType): DashboardScenario[] {
    const dir = path.join(
        rootDir,
        workspaceType,
        "src",
        "recordings",
        "metadata",
        "dashboards",
        "dashboards.json",
    );
    if (!fs.existsSync(dir)) {
        return [];
    }

    try {
        const dashboardsRaw = fs.readFileSync(dir, { encoding: "utf8" });
        const dashboards = JSON.parse(dashboardsRaw);
        return Object.keys(dashboards).map(
            (key): DashboardScenario => ({
                identifier: key,
            }),
        );
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Path ${dir} exists but is not a JSON file. Cannot read any dashboard scenarios`);
        throw err;
    }
}

export function getDashboardScenarios(): DashboardScenarios | undefined {
    const rootDir = process.env[StoreEnvVar];

    if (!rootDir) {
        // eslint-disable-next-line no-console
        console.warn(
            `The smoke-and-capture suite is not configured with store root. The suite will run but will not detect any new dashboard recordings.`,
        );

        return;
    }

    return {
        "experimental-workspace": detectDashboards(rootDir, "experimental-workspace"),
        "live-examples-workspace": detectDashboards(rootDir, "live-examples-workspace"),
        "reference-workspace": detectDashboards(rootDir, "reference-workspace"),
    };
}
