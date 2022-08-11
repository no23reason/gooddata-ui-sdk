// (C) 2021-2022 GoodData Corporation
import {
    CustomDashboardInsightComponent,
    CustomDashboardInsightMenuButtonComponent,
    CustomDashboardInsightMenuComponent,
    CustomDashboardKpiComponent,
    CustomDashboardWidgetComponent,
    CustomInsightBodyComponent,
    IInsightMenuItem,
} from "../widget/types";
import { ExtendedDashboardWidget } from "../../model";
import {
    CustomDashboardAttributeFilterComponent,
    CustomDashboardDateFilterComponent,
} from "../filterBar/types";
import { RenderMode } from "../../types";
import {
    IInsight,
    IDashboardAttributeFilter,
    IKpiWidget,
    IInsightWidget,
    IKpi,
    IDashboardDateFilter,
} from "@gooddata/sdk-model";

/**
 * @public
 */
export type OptionalProvider<T> = T extends (...args: infer TArgs) => infer TRes
    ? (...args: TArgs) => TRes | undefined
    : never;

/**
 * @public
 */
export type WidgetComponentProvider = (widget: ExtendedDashboardWidget) => CustomDashboardWidgetComponent;

/**
 * @public
 */
export type OptionalWidgetComponentProvider = OptionalProvider<WidgetComponentProvider>;

/**
 * @public
 */
export type InsightComponentProvider = (
    insight: IInsight,
    widget: IInsightWidget,
) => CustomDashboardInsightComponent;

/**
 * @public
 */
export type OptionalInsightComponentProvider = OptionalProvider<InsightComponentProvider>;

/**
 * @alpha
 */
export type InsightBodyComponentProvider = (
    insight: IInsight,
    widget: IInsightWidget,
) => CustomInsightBodyComponent;

/**
 * @alpha
 */
export type OptionalInsightBodyComponentProvider = OptionalProvider<InsightBodyComponentProvider>;

/**
 * @alpha
 */
export type InsightMenuButtonComponentProvider = (
    insight: IInsight,
    widget: IInsightWidget,
) => CustomDashboardInsightMenuButtonComponent;

/**
 * @alpha
 */
export type OptionalInsightMenuButtonComponentProvider = OptionalProvider<InsightMenuButtonComponentProvider>;

/**
 * @alpha
 */
export type InsightMenuComponentProvider = (
    insight: IInsight,
    widget: IInsightWidget,
) => CustomDashboardInsightMenuComponent;

/**
 * @alpha
 */
export type OptionalInsightMenuComponentProvider = OptionalProvider<InsightMenuComponentProvider>;

/**
 * @alpha
 */
export type InsightMenuItemsProvider = (
    insight: IInsight,
    widget: IInsightWidget,
    defaultItems: IInsightMenuItem[],
    closeMenu: () => void,
    renderMode: RenderMode,
) => IInsightMenuItem[];

/**
 * @public
 */
export type KpiComponentProvider = (kpi: IKpi, widget: IKpiWidget) => CustomDashboardKpiComponent;

/**
 * @public
 */
export type OptionalKpiComponentProvider = OptionalProvider<KpiComponentProvider>;

/**
 * @alpha
 */
export type DateFilterComponentProvider = (
    filter: IDashboardDateFilter,
) => CustomDashboardDateFilterComponent;

/**
 * @alpha
 */
export type OptionalDateFilterComponentProvider = OptionalProvider<DateFilterComponentProvider>;

/**
 * @alpha
 */
export type AttributeFilterComponentProvider = (
    filter: IDashboardAttributeFilter,
) => CustomDashboardAttributeFilterComponent;

/**
 * @alpha
 */
export type OptionalAttributeFilterComponentProvider = OptionalProvider<AttributeFilterComponentProvider>;
