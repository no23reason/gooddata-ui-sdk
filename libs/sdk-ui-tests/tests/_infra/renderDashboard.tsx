// (C) 2007-2020 GoodData Corporation
import React from "react";
import { act } from "react-dom/test-utils";
import { ObjRef } from "@gooddata/sdk-model";
import {
    DashboardView,
    DashboardInsightRenderer,
    IDashboardViewProps,
} from "@gooddata/sdk-ui-ext/dist/internal";
import { backendWithDashboardCapturing, DashboardInteractions } from "./backendWithDashboardCapturing";
import { mount, ReactWrapper } from "enzyme";

class DashboardRendererUsingEnzyme {
    public result: ReactWrapper | undefined;

    public renderFun(component: any, _: Element): void {
        this.result = mount(component);
    }
}

async function waitForComponentToPaint<P = any>(wrapper: ReactWrapper<P>) {
    await act(async () => {
        await new Promise((resolve) => setImmediate(resolve));
        wrapper.update();
    });
}

const MockComponent = () => <div />;

/**
 * Mount dashboard representing a particular test scenario.
 */
export async function mountDashboard(ref: ObjRef): Promise<DashboardInteractions> {
    const [backend, promisedInteractions] = backendWithDashboardCapturing();

    /*
     * Mapbox token flies in through IGdcConfig; some value is needed for mock-rendering of
     * the Geo charts
     */

    const enzymeRenderer = new DashboardRendererUsingEnzyme();

    const widgetRenderer: IDashboardViewProps["widgetRenderer"] = ({
        renderedWidget,
        widget,
        filters,
        insight,
    }) => {
        if (widget.type === "kpi") {
            return renderedWidget;
        }
        return (
            <DashboardInsightRenderer
                backend={backend}
                workspace={"referenceworkspace"}
                insight={insight!}
                insightWidget={widget}
                filters={filters}
                renderFun={enzymeRenderer.renderFun}
                ErrorComponent={MockComponent}
                LoadingComponent={MockComponent}
            />
        );
    };

    const x = mount(
        <DashboardView
            dashboard={ref}
            backend={backend}
            workspace={"referenceworkspace"}
            config={{ mapboxToken: "this-is-not-real-token" }}
            widgetRenderer={widgetRenderer}
        />,
    );

    await waitForComponentToPaint(x);

    const interactions = await promisedInteractions;

    return interactions;
}
