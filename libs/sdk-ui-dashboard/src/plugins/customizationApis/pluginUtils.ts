// (C) 2021-2022 GoodData Corporation

import { DashboardLayoutReadOnlyAdditionSource } from "../../model";

/**
 * Returns string that identifies a concrete plugin and can be used in log messages.
 *
 * @internal
 */
export function pluginDebugStr(plugin: DashboardLayoutReadOnlyAdditionSource): string {
    return `${plugin.debugName ?? plugin.displayName}/${plugin.version}`;
}
