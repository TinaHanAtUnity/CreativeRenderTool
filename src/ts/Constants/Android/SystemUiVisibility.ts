// see http://developer.android.com/reference/android/view/View.html#SYSTEM_UI_FLAG_VISIBLE for detailed specs
// note: most of the flags have API level restrictions

export const enum SystemUiVisibility {
    VISIBLE = 0,
    LOW_PROFILE = 1,
    HIDE_NAVIGATION = 2,
    FULLSCREEN = 4,
    LAYOUT_STABLE = 256,
    LAYOUT_HIDE_NAVIGATION = 512,
    LAYOUT_FULLSCREEN = 1024,
    IMMERSIVE = 2048,
    IMMERSIVE_STICKY = 4096,
    LIGHT_STATUS_BAR = 8192
}
