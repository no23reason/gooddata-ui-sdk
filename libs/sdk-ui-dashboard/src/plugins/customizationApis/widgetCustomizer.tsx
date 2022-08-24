// (C) 2021-2022 GoodData Corporation

import { IDashboardWidgetCustomizer } from "../customizer";
import { IDashboardCustomizationContext } from "./customizationContext";
import { CustomDashboardWidgetComponent, OptionalWidgetComponentProvider } from "../../presentation";
import { isCustomWidget } from "../../model";

/*
 * For now, this type is kept private. eventually, as we open the dashboard API for editing that includes
 * dnd experience of custom widget types then the interface should be public and plugins would be able to
 * specify full-fledged dashboard widget definitions.
 */
interface IDashboardWidgetDefinition {
    readonly widgetType: string;
    readonly DefaultComponent: CustomDashboardWidgetComponent;

    // component to use for rendering the drag handle which the user can grab and toss onto dashboard
    // readonly DragHandleComponent: React.ComponentType;

    // creates a new empty widget; this will be called when drag handle is dropped onto dashboard. the
    // factory must return a new instance of a custom widget in an empty state
    // readonly widgetFactory: () => ICustomWidget;

    // Component to use when the custom widget is being edited
    // readonly EditableComponent: React.ComponentType;
}

type CustomWidgetMap = Map<string, IDashboardWidgetDefinition>;

interface IWidgetCustomizerState {
    addDefinition(definition: IDashboardWidgetDefinition): void;
    getCustomWidgetMap(): CustomWidgetMap;
}

class WidgetCustomizerState implements IWidgetCustomizerState {
    private readonly customWidgetMap: CustomWidgetMap = new Map();

    constructor(private readonly context: IDashboardCustomizationContext) {}

    public addDefinition = (definition: IDashboardWidgetDefinition): void => {
        if (this.customWidgetMap.has(definition.widgetType)) {
            this.context.warn(
                `Redefining custom widget type ${definition.widgetType}. Previous definition will be discarded.`,
            );
        }

        this.customWidgetMap.set(definition.widgetType, definition);
    };

    public getCustomWidgetMap = (): CustomWidgetMap => {
        return this.customWidgetMap;
    };
}

class SealedCustomizerState implements IWidgetCustomizerState {
    constructor(
        private readonly state: IWidgetCustomizerState,
        private readonly context: IDashboardCustomizationContext,
    ) {}

    public addDefinition = (_definition: IDashboardWidgetDefinition): void => {
        this.context.warn(`Attempting to add custom widgets outside of plugin registration. Ignoring.`);
    };

    public getCustomWidgetMap = (): CustomWidgetMap => {
        return this.state.getCustomWidgetMap();
    };
}

export class DefaultWidgetCustomizer implements IDashboardWidgetCustomizer {
    private state: IWidgetCustomizerState = new WidgetCustomizerState(this.context);

    constructor(private readonly context: IDashboardCustomizationContext) {}

    public addCustomWidget = (
        widgetType: string,
        Component: CustomDashboardWidgetComponent,
    ): IDashboardWidgetCustomizer => {
        this.state.addDefinition({
            widgetType,
            DefaultComponent: Component,
        });

        return this;
    };

    public sealCustomizer = (): IDashboardWidgetCustomizer => {
        this.state = new SealedCustomizerState(this.state, this.context);

        return this;
    };

    public getWidgetComponentProvider = (): OptionalWidgetComponentProvider => {
        const customWidgetMap = this.state.getCustomWidgetMap();

        return (widget) => {
            if (!isCustomWidget(widget)) {
                return undefined;
            }

            const definition = customWidgetMap.get(widget.customType);

            if (!definition) {
                return undefined;
            }

            return definition.DefaultComponent;
        };
    };
}
