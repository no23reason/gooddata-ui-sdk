// (C) 2007-2020 GoodData Corporation
import React from "react";
import { act } from "react-dom/test-utils";
import { ObjRef } from "@gooddata/sdk-model";
import {
    DashboardView,
    DashboardInsightRenderer,
    IDashboardViewProps,
} from "@gooddata/sdk-ui-ext/dist/internal";
import { backendWithCapturing, DashboardInteractions } from "./backendWithCapturing2";
import { mount, ReactWrapper } from "enzyme";

// TODO RAIL-2870 how to pass this inside of the DashboardView and there to InsightRenderer without messing up the API?
class DashboardRendererUsingEnzyme {
    public result: ReactWrapper | undefined;

    public renderFun(component: any, _: Element): void {
        this.result = mount(component);
    }
}

// const waitForAsync = () => new Promise((resolve: (...args: any[]) => void) => setImmediate(resolve));

async function waitForComponentToPaint<P = {}>(wrapper: ReactWrapper<P>) {
    await act(async () => {
        console.log("PRE PROM");

        await new Promise((resolve) => setImmediate(resolve));
        console.log("POST PROM");
        wrapper.update();
    });
}

const MockComponent = () => <div />;

/**
 * Mount dashboard representing a particular test scenario.
 */
export async function mountDashboard(ref: ObjRef): Promise<DashboardInteractions> {
    const [backend, promisedInteractions] = backendWithCapturing();

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

    console.log("PRE WAIT");

    await waitForComponentToPaint(x);

    console.log("POST WAIT");
    // for (let i = 0; i < 2; i++) {
    //     // eslint-disable-next-line no-console
    //     // console.log("AAAA", x.debug());

    //     console.log("WAITING FOR ASYNC", i);

    //     await waitForAsync();
    //     x.update();
    // }

    // console.log("AAAA", x.debug());

    console.log("DONE??", promisedInteractions);

    const interactions = await promisedInteractions;

    return interactions;
}
