#[macro_export]
#[cfg(debug_assertions)]
macro_rules! console_log {
    () => (print!("\n"));
    ($($arg:tt)*) => ({
        use colored::Colorize;
        print!("  {}\t", "log".bold().cyan());
        println!($($arg)*);
    })
}
#[macro_export]
#[cfg(not(debug_assertions))]
macro_rules! console_log {
    () => {};
    ($($arg:tt)*) => {};
}

#[macro_export]
#[cfg(debug_assertions)]
macro_rules! console_warn {
    () => (print!("\n"));
    ($($arg:tt)*) => ({
        use colored::Colorize;
        print!("  {}\t", "warn".bold().yellow());
        println!($($arg)*);
    })
}
#[macro_export]
#[cfg(not(debug_assertions))]
macro_rules! console_warn {
    () => {};
    ($($arg:tt)*) => {};
}

#[macro_export]
macro_rules! console_error {
    () => (eprint!("\n"));
    ($($arg:tt)*) => ({
        use colored::Colorize;
        eprint!("  {}\t", "error".bold().red());
        eprintln!($($arg)*);
    })
}

#[macro_export]
#[cfg(debug_assertions)]
macro_rules! console_time {
    ($call:expr, $title:expr) => {{
        use colored::Colorize;
        print!("  {}\t", "time".bold().magenta());
        print!("{}:\t", $title.italic());
        let time = std::time::SystemTime::now();
        let result = $call;
        let elapsed = time.elapsed().unwrap();
        println!("{} ms", elapsed.as_millis());
        result
    }};
}
#[macro_export]
#[cfg(not(debug_assertions))]
macro_rules! console_time {
    ($call:expr, $title:expr) => {{
        $call
    }};
}
