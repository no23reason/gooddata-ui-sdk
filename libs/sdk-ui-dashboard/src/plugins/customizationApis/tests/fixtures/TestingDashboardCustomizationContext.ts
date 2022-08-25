// (C) 2022 GoodData Corporation
import { IDashboardPluginContract_V1 } from "../../../plugin";
import { IDashboardCustomizationContext } from "../../customizationContext";

export class TestingDashboardCustomizationContext implements IDashboardCustomizationContext {
    private readonly setCurrentPluginImpl: IDashboardCustomizationContext["setCurrentPlugin"] | undefined;
    private readonly getCurrentPluginImpl: IDashboardCustomizationContext["getCurrentPlugin"] | undefined;
    private readonly logImpl: IDashboardCustomizationContext["log"] | undefined;
    private readonly warnImpl: IDashboardCustomizationContext["warn"] | undefined;
    private readonly errorImpl: IDashboardCustomizationContext["error"] | undefined;

    constructor(functions: Partial<IDashboardCustomizationContext>) {
        this.setCurrentPluginImpl = functions.setCurrentPlugin;
        this.getCurrentPluginImpl = functions.getCurrentPlugin;
        this.logImpl = functions.log;
        this.warnImpl = functions.warn;
        this.errorImpl = functions.error;
    }

    setCurrentPlugin(plugin: IDashboardPluginContract_V1 | undefined): void {
        this.setCurrentPluginImpl?.(plugin);
    }
    getCurrentPlugin(): IDashboardPluginContract_V1 | undefined {
        return this.getCurrentPluginImpl?.();
    }
    log(message: string, ...optionalParams: any[]): void {
        this.logImpl?.(message, optionalParams);
    }
    warn(message: string, ...optionalParams: any[]): void {
        this.warnImpl?.(message, optionalParams);
    }
    error(message: string, ...optionalParams: any[]): void {
        this.errorImpl?.(message, optionalParams);
    }
}
