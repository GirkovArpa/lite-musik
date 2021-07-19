#![windows_subsystem="windows"]
use sciter::{ Value, dispatch_script_call, make_args };

struct EventHandler;
impl EventHandler {
     fn get_mp3_duration(&self, filename: String, callback: Value) -> () {
        println!("{}", filename);
        std::thread::spawn(move || {
            let path = std::path::Path::new(&filename);
            let duration = mp3_duration::from_path(&path).unwrap();
            callback.call(None, &make_args!(duration.as_secs() as i32), None).unwrap();
        });
    }
}
impl sciter::EventHandler for EventHandler {
    fn get_subscription(&mut self) -> Option<sciter::dom::event::EVENT_GROUPS> {
		Some(sciter::dom::event::default_events() | sciter::dom::event::EVENT_GROUPS::HANDLE_METHOD_CALL)
    }
    dispatch_script_call! (
        fn get_mp3_duration(String, Value);
    );
}
fn main() {
    sciter::set_options(sciter::RuntimeOptions::DebugMode(false)).unwrap();
    let archived = include_bytes!("../target/app.rc");
    sciter::set_options(sciter::RuntimeOptions::ScriptFeatures(
        sciter::SCRIPT_RUNTIME_FEATURES::ALLOW_SYSINFO  as u8 |
        sciter::SCRIPT_RUNTIME_FEATURES::ALLOW_FILE_IO  as u8 |
        sciter::SCRIPT_RUNTIME_FEATURES::ALLOW_EVAL     as u8 |
        sciter::SCRIPT_RUNTIME_FEATURES::ALLOW_SYSINFO  as u8 
    )).unwrap();
    let mut frame = sciter::Window::new();
    frame.event_handler(EventHandler {});
    frame.archive_handler(archived).unwrap();
    frame.load_file("this://app/main.html");
    frame.run_app();
}