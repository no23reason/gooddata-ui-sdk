// (C) 2022 GoodData Corporation
import { HiddenFilterBar } from "../../../presentation";
import { DefaultFilterBarCustomizer } from "../filterBarCustomizer";
import { TestingDashboardCustomizationContext } from "./fixtures/TestingDashboardCustomizationContext";

describe("filter bar customizer", () => {
    let Customizer: DefaultFilterBarCustomizer;
    let mockWarn: ReturnType<typeof jest.fn>;

    beforeEach(() => {
        mockWarn = jest.fn();
        Customizer = new DefaultFilterBarCustomizer(
            new TestingDashboardCustomizationContext({ warn: mockWarn }),
        );
    });

    describe("filter bar rendering mode", () => {
        it("should return undefined if no mode was explicitly set", () => {
            const actual = Customizer.getCustomizerResult();
            expect(actual.FilterBarComponent).toBeUndefined();
        });

        it("should return undefined if mode: default was explicitly set", () => {
            Customizer.setRenderingMode("default");
            const actual = Customizer.getCustomizerResult();
            expect(actual.FilterBarComponent).toBeUndefined();
        });

        it("should return HiddenFilterBar if mode: hidden set using the setter", () => {
            Customizer.setRenderingMode("hidden");
            const actual = Customizer.getCustomizerResult();
            expect(actual.FilterBarComponent).toEqual(HiddenFilterBar);
        });

        it("should use the last provided mode if set multiple times", () => {
            Customizer.setRenderingMode("default");
            Customizer.setRenderingMode("hidden");

            const actual = Customizer.getCustomizerResult();
            expect(actual.FilterBarComponent).toEqual(HiddenFilterBar);
        });

        it("should issue a warning if filter bar rendering mode is set multiple times", () => {
            Customizer.setRenderingMode("default");
            Customizer.setRenderingMode("hidden");

            expect(mockWarn).toHaveBeenCalled();
        });
    });
});
