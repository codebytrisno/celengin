use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Ambil URL dari environment variable atau fallback ke prod
      let url = std::env::var("CELENGIN_URL")
          .unwrap_or_else(|_| {
              if cfg!(debug_assertions) {
                  // Dev: IP lokal PC
                  "http://192.168.1.2:3000".to_string()
              } else {
                  // Production
                  "https://celengin-nyno.vercel.app".to_string()
              }
          });

      // Load URL eksternal di WebView
      if let Some(window) = app.get_webview_window("main") {
          let _ = window.eval(&format!("window.location.replace('{}');", url));
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
