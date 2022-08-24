// (C) 2022 GoodData Corporation
import { DashboardLayoutReadOnlyAdditionSource } from "../../../../model";
import { IDashboardPluginContract_V1 } from "../../../plugin";
import { IDashboardCustomizationContext } from "../../customizationContext";

export class TestingDashboardCustomizationContext implements IDashboardCustomizationContext {
    private readonly setCurrentPluginImpl: IDashboardCustomizationContext["setCurrentPlugin"] | undefined;
    private readonly getAdditionSourceImpl: IDashboardCustomizationContext["getAdditionSource"] | undefined;
    private readonly logImpl: IDashboardCustomizationContext["log"] | undefined;
    private readonly warnImpl: IDashboardCustomizationContext["warn"] | undefined;
    private readonly errorImpl: IDashboardCustomizationContext["error"] | undefined;

    constructor(functions: Partial<IDashboardCustomizationContext>) {
        this.setCurrentPluginImpl = functions.setCurrentPlugin;
        this.getAdditionSourceImpl = functions.getAdditionSource;
        this.logImpl = functions.log;
        this.warnImpl = functions.warn;
        this.errorImpl = functions.error;
    }

    setCurrentPlugin(plugin: IDashboardPluginContract_V1 | undefined): void {
        this.setCurrentPluginImpl?.(plugin);
    }
    getAdditionSource(): DashboardLayoutReadOnlyAdditionSource | undefined {
        return this.getAdditionSourceImpl?.();
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
