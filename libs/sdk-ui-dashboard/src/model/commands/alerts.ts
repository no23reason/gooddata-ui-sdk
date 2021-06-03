// (C) 2021 GoodData Corporation

import { IWidgetAlert, IWidgetAlertDefinition } from "@gooddata/sdk-backend-spi";
import { IDashboardCommand } from "./base";

/**
 * Creates or updates Kpi alert.
 *
 * @internal
 */
export interface CreateAlert extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.ALERTS.CREATE";
    readonly payload: {
        readonly alert: IWidgetAlertDefinition;
    };
}

/**
 * Creates the SaveAlert command. Dispatching this command will result in the creating Kpi alert on the backend.
 *
 * @param alert - specify alert to create.
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @internal
 */
export function createAlert(alert: IWidgetAlertDefinition, correlationId?: string): CreateAlert {
    return {
        type: "GDC.DASH/CMD.ALERTS.CREATE",
        correlationId,
        payload: {
            alert,
        },
    };
}

/**
 * Creates or updates Kpi alert.
 *
 * @internal
 */
export interface UpdateAlert extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.ALERTS.UPDATE";
    readonly payload: {
        readonly alert: IWidgetAlert;
    };
}

/**
 * Creates the UpdateAlert command. Dispatching this command will result in the updating Kpi alert on the backend.
 *
 * @param alert - specify alert to update.
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @internal
 */
export function updateAlert(alert: IWidgetAlert, correlationId?: string): UpdateAlert {
    return {
        type: "GDC.DASH/CMD.ALERTS.UPDATE",
        correlationId,
        payload: {
            alert,
        },
    };
}

//
//
//

/**
 * Removes Kpi alert.
 *
 * @internal
 */
export interface RemoveAlert extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.ALERTS.REMOVE";
    readonly payload: {
        readonly alert: IWidgetAlert;
    };
}

/**
 * Creates the RemoveAlert command. Dispatching this command will result in the removing Kpi alert on the backend.
 *
 * @param alertRef - specify ObjRef of the alert to remove
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @internal
 */
export function removeAlert(alert: IWidgetAlert, correlationId?: string): RemoveAlert {
    return {
        type: "GDC.DASH/CMD.ALERTS.REMOVE",
        correlationId,
        payload: {
            alert,
        },
    };
}

//
//
//
