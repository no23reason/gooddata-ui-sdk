// (C) 2021-2022 GoodData Corporation

// import { DashboardPluginDescriptor } from "../../plugins";

/**
 * Returns string that identifies a concrete plugin and can be used in log messages.
 *
 * @internal
 */
export function pluginDebugStr(plugin: any): string {
    return `${plugin.debugName ?? plugin.displayName}/${plugin.version}`;
}
