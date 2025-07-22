/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */
const primaryColor = "#2675ffff";
const primary2ndColor = "#e3ecfcff";
const secondaryColor = "#f2f2f2";
const secondary2ndColor = "#d5d5d5ff";
const successColor = "#24953eff";
const dangerColor = "#d43545ff";
const whiteColor = "#ffffff";
const tintColorLight = primaryColor;
const tintColorDark = whiteColor;

export const getPrimaryColor = () => primaryColor;
export const getPrimary2ndColor = () => primary2ndColor;
export const getSecondaryColor = () => secondaryColor;
export const getSecondary2ndColor = () => secondary2ndColor;
export const getSuccessColor = () => successColor;
export const getDangerColor = () => dangerColor;
export const getWhiteColor = () => whiteColor;

export const Colors = {
    light: {
        text: "#11181C",
        background: "#fff",
        tint: tintColorLight,
        icon: "#687076",
        tabIconDefault: "#687076",
        tabIconSelected: tintColorLight,
    },
    dark: {
        text: "#ECEDEE",
        background: "#151718",
        tint: tintColorDark,
        icon: "#9BA1A6",
        tabIconDefault: "#9BA1A6",
        tabIconSelected: tintColorDark,
    },
};
