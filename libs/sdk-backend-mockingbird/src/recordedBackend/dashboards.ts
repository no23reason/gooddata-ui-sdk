// (C) 2019-2021 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import isEmpty from "lodash/isEmpty";
import {
    FilterContextItem,
    IDashboard,
    IDashboardDefinition,
    IDashboardWithReferences,
    IFilterContextDefinition,
    IListedDashboard,
    IScheduledMail,
    IScheduledMailDefinition,
    IWidget,
    IWidgetAlert,
    IWidgetAlertCount,
    IWidgetAlertDefinition,
    IWidgetReferences,
    IWorkspaceDashboardsService,
    NotSupported,
    UnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import { ObjRef, IFilter, isIdentifierRef, uriRef, idRef } from "@gooddata/sdk-model";
import { DashboardRecording, RecordedRefType, RecordingIndex } from "./types";
import { identifierToRecording } from "./utils";

/**
 * Note: the impl always makes / gives clones of recorded dashboards to prevent mutable operations
 * impacting the recordings and thus violate client-server interaction integrity (client mutates, server
 * suddenly starts returning modified data for everyone)
 *
 * @internal
 */
export class RecordedDashboards implements IWorkspaceDashboardsService {
    private readonly dashboards: { [id: string]: DashboardRecording };

    constructor(
        recordings: RecordingIndex,
        public workspace: string,
        private readonly dashboardRefType: RecordedRefType,
    ) {
        this.dashboards = recordings.metadata?.dashboards ?? {};
    }

    public getDashboards(): Promise<IListedDashboard[]> {
        throw new NotSupported("Method not implemented.");
    }

    public async getDashboard(ref: ObjRef, filterContextRef?: ObjRef): Promise<IDashboard> {
        if (isEmpty(this.dashboards)) {
            throw new UnexpectedResponseError("No dashboard recordings", 404, {});
        }

        if (filterContextRef) {
            throw new NotSupported("Specifying custom filter context is not supported.");
        }

        /*
         * recorded backend treats both identifier and URI as ID; the value will be used to look up
         * dashboard in the recording index
         */
        const id = isIdentifierRef(ref) ? ref.identifier : ref.uri;
        const recordingId = recId(identifierToRecording(id));
        const recording = this.dashboards[recordingId];

        if (!recording) {
            throw new UnexpectedResponseError(`No dashboard with ID: ${id}`, 404, {});
        }

        return this.createDashboardWithRef(recording.obj.dashboard);
    }

    public getDashboardWithReferences(
        _ref: ObjRef,
        _filterContextRef?: ObjRef,
    ): Promise<IDashboardWithReferences> {
        throw new NotSupported("getDashboardWithReferences not implemented.");
    }

    public createDashboard(_dashboard: IDashboardDefinition): Promise<IDashboard> {
        throw new NotSupported("createDashboard not implemented.");
    }

    public updateDashboard(
        _dashboard: IDashboard,
        _updatedDashboard: IDashboardDefinition,
    ): Promise<IDashboard> {
        throw new NotSupported("updateDashboard not implemented.");
    }

    public async deleteDashboard(ref: ObjRef): Promise<void> {
        const id = isIdentifierRef(ref) ? ref.identifier : ref.uri;
        const recordingId = recId(id);

        if (!this.dashboards[recordingId]) {
            throw new UnexpectedResponseError(`No dashboard with ID: ${id}`, 404, {});
        }

        delete this.dashboards[recordingId];
    }

    public exportDashboardToPdf(_ref: ObjRef, _filters?: FilterContextItem[]): Promise<string> {
        throw new NotSupported("Method not implemented.");
    }

    public createScheduledMail(
        _scheduledMail: IScheduledMailDefinition,
        _exportFilterContext?: IFilterContextDefinition,
    ): Promise<IScheduledMail> {
        throw new NotSupported("createScheduledMail not implemented.");
    }

    public async getScheduledMailsCountForDashboard(_ref: ObjRef): Promise<number> {
        // TODO
        return 0;
    }

    public async getAllWidgetAlertsForCurrentUser(): Promise<IWidgetAlert[]> {
        // TODO
        return [];
    }

    public async getDashboardWidgetAlertsForCurrentUser(_ref: ObjRef): Promise<IWidgetAlert[]> {
        // TODO
        return [];
    }

    public async getWidgetAlertsCountForWidgets(_refs: ObjRef[]): Promise<IWidgetAlertCount[]> {
        // TODO
        return [];
    }

    public createWidgetAlert(_alert: IWidgetAlertDefinition): Promise<IWidgetAlert> {
        throw new NotSupported("createWidgetAlert not implemented.");
    }

    public updateWidgetAlert(_alert: IWidgetAlert | IWidgetAlertDefinition): Promise<IWidgetAlert> {
        throw new NotSupported("updateWidgetAlert not implemented.");
    }

    public deleteWidgetAlert(_ref: ObjRef): Promise<void> {
        throw new NotSupported("deleteWidgetAlert not implemented.");
    }

    public deleteWidgetAlerts(_refs: ObjRef[]): Promise<void> {
        throw new NotSupported("deleteWidgetAlerts not implemented.");
    }

    public getWidgetReferencedObjects(
        _widget: IWidget,
        _types?: ("measure" | "analyticalDashboard" | "visualizationObject" | "filterContext")[],
    ): Promise<IWidgetReferences> {
        throw new NotSupported("getWidgetReferencedObjects not implemented.");
    }

    public async getResolvedFiltersForWidget(_widget: IWidget, filters: IFilter[]): Promise<IFilter[]> {
        // TODO
        return filters;
    }

    private createDashboardWithRef(obj: IDashboard): IDashboard {
        return {
            ...cloneDeep(obj),
            ref: this.createRef(obj.uri, obj.identifier),
        };
    }

    private createRef(uri: string, id: string): ObjRef {
        return this.dashboardRefType === "uri" ? uriRef(uri) : idRef(id, "analyticalDashboard");
    }
}

function recId(forId: string): string {
    return `d_${identifierToRecording(forId)}`;
}
