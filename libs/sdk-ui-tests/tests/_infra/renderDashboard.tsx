// (C) 2007-2020 GoodData Corporation

import { ObjRef } from "@gooddata/sdk-model";
import { DashboardView } from "@gooddata/sdk-ui-ext/dist/internal";
import { backendWithCapturing, ChartInteractions } from "./backendWithCapturing2";
import { mount } from "enzyme";
import React from "react";

// TODO RAIL-2870 how to pass this inside of the DashboardView and there to InsightRenderer without messing up the API?
// class DashboardRendererUsingEnzyme {
//     public result: ReactWrapper | undefined;

//     public renderFun(component: any, _: Element): void {
//         this.result = mount(component);
//     }
// }

const waitForAsync = () => new Promise((resolve: (...args: any[]) => void) => setImmediate(resolve));

/**
 * Mount dashboard representing a particular test scenario.
 */
export async function mountDashboard(ref: ObjRef): Promise<ChartInteractions> {
    const [backend, promisedInteractions] = backendWithCapturing();

    /*
     * Mapbox token flies in through IGdcConfig; some value is needed for mock-rendering of
     * the Geo charts
     */

    const x = mount(
        <DashboardView
            dashboard={ref}
            backend={backend}
            workspace={"referenceworkspace"}
            config={{ mapboxToken: "this-is-not-real-token" }}
        />,
    );
    // eslint-disable-next-line no-console
    // console.log("AAAA", x.debug());

    await waitForAsync();
    x.update();

    // eslint-disable-next-line no-console
    // console.log("BBBB", x.debug());

    await waitForAsync();
    x.update();

    // eslint-disable-next-line no-console
    // console.log("CCCC", x.debug());

    await waitForAsync();
    x.update();

    // eslint-disable-next-line no-console
    // console.log("DDDD", x.debug());

    const interactions = await promisedInteractions;

    return interactions;
}
