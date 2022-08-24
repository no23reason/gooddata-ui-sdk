// (C) 2021-2022 GoodData Corporation

import {
    IDashboardCustomizer,
    IDashboardInsightCustomizer,
    IDashboardKpiCustomizer,
    IDashboardLayoutCustomizer,
    IDashboardWidgetCustomizer,
    IFilterBarCustomizer,
    IFiltersCustomizer,
} from "../customizer";
import { IDashboardExtensionProps } from "../../presentation";
import { DefaultInsightCustomizer } from "./insightCustomizer";
import { DashboardCustomizationContext } from "./customizationContext";
import { IDashboardPluginContract_V1 } from "../plugin";
import { DefaultKpiCustomizer } from "./kpiCustomizer";
import { DefaultWidgetCustomizer } from "./widgetCustomizer";
import { DefaultLayoutCustomizer } from "./layoutCustomizer";
import { DefaultFilterBarCustomizer } from "./filterBarCustomizer";
import { DefaultFiltersCustomizer } from "./filtersCustomizer";

/**
 * @internal
 */
export class DashboardCustomizationBuilder implements IDashboardCustomizer {
    private readonly context: DashboardCustomizationContext = new DashboardCustomizationContext();
    private readonly insightCustomizer: DefaultInsightCustomizer = new DefaultInsightCustomizer(this.context);
    private readonly kpiCustomizer: DefaultKpiCustomizer = new DefaultKpiCustomizer(this.context);
    private readonly widgetCustomizer: DefaultWidgetCustomizer = new DefaultWidgetCustomizer(this.context);
    private readonly layoutCustomizer: DefaultLayoutCustomizer = new DefaultLayoutCustomizer(this.context);
    private readonly filterBarCustomizer: DefaultFilterBarCustomizer = new DefaultFilterBarCustomizer(
        this.context,
    );
    private readonly filtersCustomizer: DefaultFiltersCustomizer = new DefaultFiltersCustomizer(this.context);

    private sealCustomizers = (): void => {
        this.insightCustomizer.sealCustomizer();
        this.kpiCustomizer.sealCustomizer();
        this.widgetCustomizer.sealCustomizer();
        this.filtersCustomizer.sealCustomizer();
        this.layoutCustomizer.sealCustomizer();
    };

    public insightWidgets = (): IDashboardInsightCustomizer => {
        return this.insightCustomizer;
    };

    public kpiWidgets = (): IDashboardKpiCustomizer => {
        return this.kpiCustomizer;
    };

    public customWidgets = (): IDashboardWidgetCustomizer => {
        return this.widgetCustomizer;
    };

    public layout = (): IDashboardLayoutCustomizer => {
        return this.layoutCustomizer;
    };

    public filterBar = (): IFilterBarCustomizer => {
        return this.filterBarCustomizer;
    };

    public filters = (): IFiltersCustomizer => {
        return this.filtersCustomizer;
    };

    public onBeforePluginRegister = (plugin: IDashboardPluginContract_V1): void => {
        this.context.setCurrentPlugin(plugin);
        this.context.log("Starting registration.");
    };

    public onAfterPluginRegister = (): void => {
        this.context.log("Registration finished.");

        this.context.setCurrentPlugin(undefined);
    };

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public onPluginRegisterError = (error: any): void => {
        this.context.error(
            "Plugin register() method threw and exception. Plugin may be partially registered.",
            error,
        );

        this.context.setCurrentPlugin(undefined);
    };

    public build = (): IDashboardExtensionProps => {
        const filterBarCustomizerResult = this.filterBarCustomizer.getCustomizerResult();

        const props: IDashboardExtensionProps = {
            InsightComponentProvider: this.insightCustomizer.getInsightProvider(),
            InsightBodyComponentProvider: this.insightCustomizer.getInsightBodyComponentProvider(),
            KpiComponentProvider: this.kpiCustomizer.getKpiProvider(),
            WidgetComponentProvider: this.widgetCustomizer.getWidgetComponentProvider(),
            DashboardAttributeFilterComponentProvider: this.filtersCustomizer
                .attribute()
                .getAttributeFilterProvider(),
            DashboardDateFilterComponentProvider: this.filtersCustomizer.date().getDateFilterProvider(),
            customizationFns: {
                readonlyAdditionsFactory: this.layoutCustomizer.getReadOnlyAdditionsFactory(),
            },
            // only set the value if there is anything to set
            ...(filterBarCustomizerResult.FilterBarComponent
                ? { FilterBarComponent: filterBarCustomizerResult.FilterBarComponent }
                : {}),
        };

        this.sealCustomizers();

        return props;
    };
}
