// (C) 2023 GoodData Corporation
import React from "react";
import { describe, it, expect } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IFilterButtonCustomIcon } from "../../../interfaces/index.js";
import { FilterButtonCustomIcon } from "../FilterButtonCustomIcon.js";

const CUSTOM_ICON_WRAPPER_SELECTOR = ".s-gd-filter-button-custom-icon-wrapper";

describe("FilterButtonCustomIcon", () => {
    const renderCustomIcon = (params?: { customIcon?: IFilterButtonCustomIcon }) => {
        return render(<FilterButtonCustomIcon {...params} />);
    };

    it("should render custom icon correctly", async () => {
        const customIcon: IFilterButtonCustomIcon = {
            icon: "gd-icon-lock",
            tooltip: "This filter is locked, its value cannot be changed outside of edit mode.",
            bubbleClassNames: "bubble-primary",
            bubbleAlignPoints: [{ align: "bc tl", offset: { x: 0, y: 7 } }],
        };

        renderCustomIcon({ customIcon });
        const icon = document.querySelector(`.${customIcon.icon}`);
        expect(icon).toBeInTheDocument();

        fireEvent.mouseOver(document.querySelector(`.${customIcon.icon}`));
        await waitFor(async () => {
            expect(screen.queryByText(customIcon.tooltip)).toBeInTheDocument();
        });
    });

    it("should not render custom icon when customIcon is undefined", () => {
        const { container } = renderCustomIcon();
        expect(container.querySelector(CUSTOM_ICON_WRAPPER_SELECTOR)).toBeFalsy();
    });
});
