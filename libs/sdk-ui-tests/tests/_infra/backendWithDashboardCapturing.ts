// (C) 2020 GoodData Corporation

import { dummyBackend, recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IAnalyticalBackend, IAnalyticalWorkspace } from "@gooddata/sdk-backend-spi";
import { defFingerprint, IExecutionDefinition } from "@gooddata/sdk-model";
import { NormalizationState, withEventing, withNormalization } from "@gooddata/sdk-backend-base";
import { DataViewRequests } from "@gooddata/mock-handling";

/**
 * Recorded dashboard interaction
 */
export type DashboardInteraction = {
    /**
     * The execution that was actually triggered
     */
    triggeredExecution: IExecutionDefinition;

    /**
     * What data views were requested during rendering
     */
    dataViewRequests: DataViewRequests;
};

export type DashboardInteractions<TInteraction = DashboardInteraction> = {
    interactions: Record<string, TInteraction>;

    /**
     * If execution normalization is in effect, then this describes what the
     * normalization process did.
     */
    normalizationState?: NormalizationState;
};

function hybridWorkspace(recorded: IAnalyticalWorkspace, dummy: IAnalyticalWorkspace): IAnalyticalWorkspace {
    return {
        ...recorded,
        execution() {
            return dummy.execution();
        },
    };
}

function hybridBackend(recorded: IAnalyticalBackend, dummy: IAnalyticalBackend): IAnalyticalBackend {
    const backend: IAnalyticalBackend = {
        ...recorded,
        onHostname(_) {
            return this;
        },
        withAuthentication() {
            return this;
        },
        withTelemetry() {
            return this;
        },
        workspace(id: string) {
            return hybridWorkspace(recorded.workspace(id), dummy.workspace(id));
        },
    };

    return backend;
}

/**
 * Creates an instance of backend which captures interactions of a dashboard with the execution service.
 */
export function backendWithDashboardCapturing(
    normalize: boolean = false,
): [IAnalyticalBackend, Promise<DashboardInteractions>] {
    type WrappedDashboardInteraction = DashboardInteraction & { done?: boolean };

    const allInteractions: DashboardInteractions<WrappedDashboardInteraction> = {
        interactions: {},
    };

    // const capturedInteractions = Promise.resolve(allInteractions);
    let dataRequestResolver: (interactions: DashboardInteractions) => void;
    const capturedInteractions = new Promise<DashboardInteractions>((resolve) => {
        dataRequestResolver = resolve;
    });

    const checkEnding = () => {
        const areAllDone = Object.values(allInteractions.interactions).every((i) => i.done);

        if (areAllDone) {
            // get rid of the "done" flag, we do not need it anymore
            Object.values(allInteractions.interactions).forEach((value) => {
                delete value.done;
            });
            dataRequestResolver(allInteractions);
        }
    };

    let backend = withEventing(
        hybridBackend(
            recordedBackend(ReferenceRecordings.Recordings),
            dummyBackend({ hostname: "test", raiseNoDataExceptions: true }),
        ),
        {
            beforeExecute: (def) => {
                const fingerprint = defFingerprint(def);

                if (allInteractions.interactions[fingerprint]) {
                    return;
                }

                allInteractions.interactions[fingerprint] = {
                    triggeredExecution: def,
                    dataViewRequests: {},
                    done: false,
                };
            },
            failedResultReadAll: (_, def) => {
                const fingerprint = defFingerprint(def);

                if (!allInteractions.interactions[fingerprint]) {
                    throw new Error("Definition not found");
                }

                if (allInteractions.interactions[fingerprint].done) {
                    return;
                }

                allInteractions.interactions[fingerprint].dataViewRequests.allData = true;
                allInteractions.interactions[fingerprint].done = true;

                checkEnding();
            },
            failedResultReadWindow: (offset, size, _e, def) => {
                const fingerprint = defFingerprint(def);

                if (!allInteractions.interactions[fingerprint]) {
                    throw new Error("Definition not found");
                }

                if (allInteractions.interactions[fingerprint].done) {
                    return;
                }

                if (!allInteractions.interactions[fingerprint].dataViewRequests.windows) {
                    allInteractions.interactions[fingerprint].dataViewRequests.windows = [];
                }

                allInteractions.interactions[fingerprint].dataViewRequests.windows?.push({
                    offset,
                    size,
                });
                allInteractions.interactions[fingerprint].done = true;

                checkEnding();
            },
        },
    );

    if (normalize) {
        backend = withNormalization(backend, {
            normalizationStatus: (state: NormalizationState) => {
                allInteractions.normalizationState = state;
            },
        });
    }

    return [backend, capturedInteractions];
}
