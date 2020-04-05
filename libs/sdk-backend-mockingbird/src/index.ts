// (C) 2019-2020 GoodData Corporation

import { dummyBackend, dummyBackendEmptyData, dummyDataView } from "@gooddata/sdk-backend-base";
export { dummyBackend, dummyBackendEmptyData, dummyDataView };

export { recordedBackend } from "./recordedBackend";

export {
    RecordingIndex,
    ExecutionRecording,
    InsightRecording,
    DisplayFormRecording,
    ScenarioRecording,
    RecordedBackendConfig,
    CatalogRecording,
    VisClassesRecording,
} from "./recordedBackend/types";

export {
    recordedDataView,
    DataViewAll,
    dataViewWindow,
    DataViewFirstPage,
} from "./recordedBackend/execution";

export {
    LegacyExecutionRecording,
    legacyRecordedBackend,
    legacyRecordedDataView,
} from "./legacyRecordedBackend";
