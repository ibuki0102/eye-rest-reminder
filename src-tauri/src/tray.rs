use tauri::{menu::MenuItem, tray::TrayIcon, AppHandle, Manager, Runtime};

pub struct TrayMenu<R: Runtime> {
    pub tray: TrayIcon<R>,
    pub status: MenuItem<R>,
    pub toggle: MenuItem<R>,
    pub quit: MenuItem<R>,
}

#[tauri::command]
pub fn set_tray_labels(app: AppHandle, app_name: String, quit_label: String) -> Result<(), String> {
    let menu = app.state::<TrayMenu<tauri::Wry>>();

    menu.tray
        .set_tooltip(Some(&app_name))
        .map_err(|error| error.to_string())?;
    menu.quit
        .set_text(quit_label)
        .map_err(|error| error.to_string())?;

    if let Some(window) = app.get_webview_window("main") {
        window
            .set_title(&app_name)
            .map_err(|error| error.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn set_tray_state(
    app: AppHandle,
    status_label: String,
    toggle_label: String,
) -> Result<(), String> {
    let menu = app.state::<TrayMenu<tauri::Wry>>();

    menu.status
        .set_text(&status_label)
        .map_err(|error| error.to_string())?;
    menu.toggle
        .set_text(toggle_label)
        .map_err(|error| error.to_string())?;

    Ok(())
}
