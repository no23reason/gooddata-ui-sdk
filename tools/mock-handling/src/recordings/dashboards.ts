// (C) 2007-2021 GoodData Corporation

import { IRecording, readJsonSync, RecordingIndexEntry, RecordingType, writeAsJsonSync } from "./common";
import { IAnalyticalBackend, IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import fs from "fs";
import path from "path";
import { idRef } from "@gooddata/sdk-model";
import { createUniqueVariableNameForIdentifier } from "../base/variableNaming";

//
// internal constants & types
//

//
// Public API
//

export const DashboardsDefinition = "dashboards.json";
const DashboardObj = "obj.json";

export class DashboardRecording implements IRecording {
    public readonly directory: string;
    private readonly dashboardId: string;
    private readonly objFile: string;

    constructor(rootDir: string, dashboardId: string) {
        this.directory = path.join(rootDir, dashboardId);
        this.dashboardId = dashboardId;

        this.objFile = path.join(this.directory, DashboardObj);
    }

    public getRecordingType(): RecordingType {
        return RecordingType.Dashboards;
    }

    public getRecordingName(): string {
        return `d_${createUniqueVariableNameForIdentifier(this.dashboardId)}`;
    }

    public getDashboardTitle(): string {
        const obj = readJsonSync(this.objFile) as IDashboardWithReferences;

        return obj.dashboard.title;
    }

    public isComplete(): boolean {
        return fs.existsSync(this.directory) && fs.existsSync(this.objFile);
    }

    public getEntryForRecordingIndex(): RecordingIndexEntry {
        return {
            obj: this.objFile,
        };
    }

    public async makeRecording(
        backend: IAnalyticalBackend,
        workspace: string,
        newWorkspaceId?: string,
    ): Promise<void> {
        const obj = await backend
            .workspace(workspace)
            .dashboards()
            .getDashboardWithReferences(idRef(this.dashboardId));

        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory, { recursive: true });
        }

        const replaceString: [string, string] | undefined = newWorkspaceId
            ? [workspace, newWorkspaceId]
            : undefined;

        writeAsJsonSync(this.objFile, obj, { replaceString });
    }
}
