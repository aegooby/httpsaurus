#[macro_export]
macro_rules! console_log {
    () => (print!("\n"));
    ($($arg:tt)*) => ({
        use colored::Colorize;
        print!(
            "{}{}{} ",
            "[turtle(".bold().black(),
            "log".bold().cyan(),
            ")]".bold().black(),
        );
        println!($($arg)*);
    })
}

#[macro_export]
macro_rules! console_error {
    () => (eprint!("\n"));
    ($($arg:tt)*) => ({
        use colored::Colorize;
        eprint!(
            "{}{}{} ",
            "[turtle(".bold().black(),
            "error".bold().red(),
            ")]".bold().black(),
        );
        eprintln!($($arg)*);
    })
}
