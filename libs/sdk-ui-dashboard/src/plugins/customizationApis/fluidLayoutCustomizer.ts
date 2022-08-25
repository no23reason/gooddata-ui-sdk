// (C) 2021-2022 GoodData Corporation
import { IDashboardLayoutSection, IDashboardLayoutItem } from "@gooddata/sdk-model";
import { IFluidLayoutCustomizer } from "../customizer";
import {
    ICustomWidget,
    AddReadonlyLayoutSection,
    AddReadonlyLayoutItem,
    DashboardLayoutReadOnlyAdditions,
} from "../../model";
import isEmpty from "lodash/isEmpty";
import { IDashboardCustomizationContext } from "./customizationContext";
import cloneDeep from "lodash/cloneDeep";

export class FluidLayoutCustomizer implements IFluidLayoutCustomizer {
    private readonly addItemOps: AddReadonlyLayoutItem[] = [];
    private readonly addSectionOps: AddReadonlyLayoutSection[] = [];

    constructor(private readonly context: IDashboardCustomizationContext) {}

    public addItem = (
        sectionIndex: number,
        itemIndex: number,
        item: IDashboardLayoutItem<ICustomWidget>,
    ): IFluidLayoutCustomizer => {
        if (!item.widget) {
            this.context.warn(
                `Item to add to section ${sectionIndex} at index ${itemIndex} does not contain any widget. The item will not be added at all.`,
                item,
            );

            return this;
        }

        this.addItemOps.push({
            sectionIndex,
            itemIndex,
            item: cloneDeep(item),
        });

        return this;
    };

    public addSection = (
        index: number,
        section: IDashboardLayoutSection<ICustomWidget>,
    ): IFluidLayoutCustomizer => {
        if (isEmpty(section.items)) {
            this.context.warn(
                `Section to add at index ${index} contains no items. The section will not be added at all.`,
                section,
            );

            return this;
        }

        const itemsWithoutWidget = section.items.filter((item) => item.widget === undefined);

        if (!isEmpty(itemsWithoutWidget)) {
            this.context.warn(
                `Section to add at index ${index} contains items that do not specify any widgets. The section will not be added at all.`,
                section,
            );

            return this;
        }

        this.addSectionOps.push({
            index,
            section: cloneDeep(section),
        });
        return this;
    };

    public getReadOnlyAdditions = (): DashboardLayoutReadOnlyAdditions => {
        return {
            items: [...this.addItemOps],
            sections: [...this.addSectionOps],
        };
    };
}
