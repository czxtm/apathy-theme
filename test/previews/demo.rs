/// Rust Semantic Token Demonstration
/// Showcases semantic highlighting for Rust code

use std::collections::HashMap;
use std::fmt::{self, Display};

// Enums with data
#[derive(Debug, Clone, PartialEq)]
pub enum UserRole {
    Admin { permissions: Vec<String> },
    Moderator { level: u8 },
    User,
    Guest,
}

// Structs
#[derive(Debug, Clone)]
pub struct User {
    id: u64,
    name: String,
    email: String,
    role: UserRole,
    active: bool,
}

#[derive(Debug)]
pub struct UserManager {
    users: HashMap<u64, User>,
    next_id: u64,
}

// Trait definitions
pub trait Authenticable {
    fn authenticate(&self, password: &str) -> bool;
    fn has_permission(&self, permission: &str) -> bool;
}

pub trait Validator {
    fn validate(&self) -> Result<(), ValidationError>;
}

// Custom error type
#[derive(Debug)]
pub enum ValidationError {
    EmptyName,
    InvalidEmail,
    UnknownError(String),
}

impl Display for ValidationError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            ValidationError::EmptyName => write!(f, "Name cannot be empty"),
            ValidationError::InvalidEmail => write!(f, "Invalid email format"),
            ValidationError::UnknownError(msg) => write!(f, "Error: {}", msg),
        }
    }
}

impl std::error::Error for ValidationError {}

// Implementation blocks
impl User {
    pub fn new(name: String, email: String, role: UserRole) -> Self {
        Self {
            id: 0,
            name,
            email,
            role,
            active: true,
        }
    }

    pub fn is_admin(&self) -> bool {
        matches!(self.role, UserRole::Admin { .. })
    }

    pub fn deactivate(&mut self) {
        self.active = false;
    }

    fn validate_email(email: &str) -> bool {
        email.contains('@') && email.contains('.')
    }
}

impl Validator for User {
    fn validate(&self) -> Result<(), ValidationError> {
        if self.name.is_empty() {
            return Err(ValidationError::EmptyName);
        }
        if !Self::validate_email(&self.email) {
            return Err(ValidationError::InvalidEmail);
        }
        Ok(())
    }
}

impl Display for User {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "User(id={}, name={}, role={:?})", self.id, self.name, self.role)
    }
}

impl UserManager {
    pub fn new() -> Self {
        Self {
            users: HashMap::new(),
            next_id: 1,
        }
    }

    pub fn add_user(&mut self, mut user: User) -> u64 {
        let id = self.next_id;
        user.id = id;
        self.users.insert(id, user);
        self.next_id += 1;
        id
    }

    pub fn get_user(&self, id: u64) -> Option<&User> {
        self.users.get(&id)
    }

    pub fn get_user_mut(&mut self, id: u64) -> Option<&mut User> {
        self.users.get_mut(&id)
    }

    pub fn remove_user(&mut self, id: u64) -> Option<User> {
        self.users.remove(&id)
    }

    pub fn find_by_name(&self, name: &str) -> Vec<&User> {
        self.users
            .values()
            .filter(|user| user.name == name)
            .collect()
    }

    pub fn active_users(&self) -> impl Iterator<Item = &User> {
        self.users.values().filter(|user| user.active)
    }
}

impl Default for UserManager {
    fn default() -> Self {
        Self::new()
    }
}

// Generic functions
pub fn find_by_id<'a, T>(items: &'a [T], predicate: impl Fn(&T) -> bool) -> Option<&'a T> {
    items.iter().find(|item| predicate(item))
}

pub fn map_collection<T, U, F>(items: Vec<T>, mapper: F) -> Vec<U>
where
    F: Fn(T) -> U,
{
    items.into_iter().map(mapper).collect()
}

// Macros
macro_rules! create_user {
    ($name:expr, $email:expr) => {
        User::new($name.to_string(), $email.to_string(), UserRole::User)
    };
    ($name:expr, $email:expr, $role:expr) => {
        User::new($name.to_string(), $email.to_string(), $role)
    };
}

// Constants and statics
const MAX_USERS: usize = 1000;
const DEFAULT_ROLE: UserRole = UserRole::User;
static mut GLOBAL_COUNT: u64 = 0;

// Associated functions and methods demonstration
pub mod utils {
    use super::*;

    pub fn is_valid_username(username: &str) -> bool {
        username.len() >= 3 && username.chars().all(|c| c.is_alphanumeric() || c == '_')
    }

    pub fn format_user_info(user: &User) -> String {
        format!("{} <{}>", user.name, user.email)
    }
}

// Main function with various patterns
fn main() {
    let mut manager = UserManager::new();

    // Creating users with different patterns
    let admin = create_user!("Alice", "alice@example.com", UserRole::Admin {
        permissions: vec!["read".to_string(), "write".to_string(), "delete".to_string()]
    });

    let moderator = User::new(
        "Bob".to_string(),
        "bob@example.com",
        UserRole::Moderator { level: 5 },
    );

    let regular_user = create_user!("Charlie", "charlie@example.com");

    // Adding users
    let admin_id = manager.add_user(admin);
    let mod_id = manager.add_user(moderator);
    let user_id = manager.add_user(regular_user);

    // Pattern matching
    if let Some(user) = manager.get_user(admin_id) {
        match &user.role {
            UserRole::Admin { permissions } => {
                println!("Admin with {} permissions", permissions.len());
            }
            UserRole::Moderator { level } => {
                println!("Moderator level {}", level);
            }
            UserRole::User => println!("Regular user"),
            UserRole::Guest => println!("Guest user"),
        }
    }

    // Iterators and closures
    let active_count = manager.active_users().count();
    println!("Active users: {}", active_count);

    let names: Vec<String> = manager
        .active_users()
        .map(|u| u.name.clone())
        .collect();

    // Error handling
    let test_user = User::new("".to_string(), "test@example.com".to_string(), UserRole::User);
    match test_user.validate() {
        Ok(_) => println!("User is valid"),
        Err(e) => eprintln!("Validation error: {}", e),
    }

    // Lifetime and borrowing examples
    let user_ref = manager.get_user(user_id);
    if let Some(u) = user_ref {
        println!("Found user: {}", u);
    }

    // Mutable borrowing
    if let Some(user) = manager.get_user_mut(mod_id) {
        user.deactivate();
    }

    // Using utility functions
    let valid = utils::is_valid_username("test_user_123");
    println!("Username valid: {}", valid);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_user_creation() {
        let user = User::new("Test".to_string(), "test@example.com".to_string(), UserRole::User);
        assert_eq!(user.name, "Test");
        assert!(user.active);
    }

    #[test]
    fn test_user_manager() {
        let mut manager = UserManager::new();
        let user = create_user!("Alice", "alice@example.com");
        let id = manager.add_user(user);
        assert!(manager.get_user(id).is_some());
    }
}


//! Peek behavior for the widget.
//!
//! Monitors Option key state and cursor position to control widget visibility.
//! The widget hides off-screen in the bottom-right corner and "peeks" when
//! Option is held and the cursor is near the corner.

use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager, PhysicalPosition, Runtime};

/// Size of the widget window
const WIDGET_SIZE: f64 = 500.0;
/// How far off-screen the widget hides
const HIDE_OFFSET: f64 = 100.0;
/// Corner detection zone size
const CORNER_ZONE: f64 = 300.0;
/// Polling interval for monitoring
const POLL_INTERVAL_MS: u64 = 50;
/// Enable verbose logging for debugging
const DEBUG_LOGGING: bool = true;

macro_rules! peek_log {
    ($($arg:tt)*) => {
        if DEBUG_LOGGING {
            eprintln!("[peek] {}", format!($($arg)*));
        }
    };
}

// Track if the widget is "locked" open (user clicked to expand)
static LOCKED_OPEN: AtomicBool = AtomicBool::new(false);
// Track if peek monitoring is active
static MONITORING_ACTIVE: AtomicBool = AtomicBool::new(false);

/// External functions from Core Graphics for macOS
#[cfg(target_os = "macos")]
mod macos {
    use std::ffi::c_void;

    #[repr(C)]
    pub struct CGPoint {
        pub x: f64,
        pub y: f64,
    }

    // CGEventSourceStateID
    pub const COMBINED_SESSION_STATE: i32 = 0;

    // CGEventFlags for Option key
    pub const ALTERNATE_FLAG: u64 = 0x00080000;

    #[link(name = "CoreGraphics", kind = "framework")]
    extern "C" {
        pub fn CGEventSourceFlagsState(stateID: i32) -> u64;
        pub fn CGEventCreate(source: *const c_void) -> *const c_void;
        pub fn CGEventGetLocation(event: *const c_void) -> CGPoint;
        pub fn CFRelease(cf: *const c_void);
    }

    /// Checks if the Option (Alt) key is currently held down.
    pub fn is_option_held() -> bool {
        unsafe {
            let flags = CGEventSourceFlagsState(COMBINED_SESSION_STATE);
            (flags & ALTERNATE_FLAG) != 0
        }
    }

    /// Gets the current cursor position on screen.
    pub fn get_cursor_position() -> (f64, f64) {
        unsafe {
            let event = CGEventCreate(std::ptr::null());
            if event.is_null() {
                return (0.0, 0.0);
            }
            let point = CGEventGetLocation(event);
            CFRelease(event);
            (point.x, point.y)
        }
    }
}

#[cfg(not(target_os = "macos"))]
mod macos {
    pub fn is_option_held() -> bool {
        false
    }
    pub fn get_cursor_position() -> (f64, f64) {
        (0.0, 0.0)
    }
}

/// Widget visibility state
#[derive(Debug, Clone, Copy, PartialEq, serde::Serialize)]
#[serde(rename_all = "lowercase")]
pub enum PeekState {
    Hidden,
    Peeking,
    Expanded,
}

/// Positions for the widget
struct WindowPositions {
    hidden_x: f64,
    hidden_y: f64,
    peek_x: f64,
    peek_y: f64,
    screen_width: f64,
    screen_height: f64,
}

impl WindowPositions {
    fn new(screen_width: f64, screen_height: f64) -> Self {
        // Hidden: mostly off-screen at bottom-right
        let hidden_x = screen_width - (WIDGET_SIZE - HIDE_OFFSET);
        let hidden_y = screen_height - (WIDGET_SIZE - HIDE_OFFSET);

        // Peeking: visible in bottom-right corner
        let peek_x = screen_width - WIDGET_SIZE;
        let peek_y = screen_height - WIDGET_SIZE;

        Self {
            hidden_x,
            hidden_y,
            peek_x,
            peek_y,
            screen_width,
            screen_height,
        }
    }

    /// Check if cursor is in the bottom-right corner zone
    fn is_cursor_in_corner(&self, cursor_x: f64, cursor_y: f64) -> bool {
        cursor_x >= self.screen_width - CORNER_ZONE && cursor_y >= self.screen_height - CORNER_ZONE
    }
}

/// Sets the widget to locked open state (user clicked to expand)
pub fn lock_expanded() {
    peek_log!("🔒 Locking widget EXPANDED (user clicked)");
    LOCKED_OPEN.store(true, Ordering::SeqCst);
}

/// Resets the widget to hidden state
pub fn unlock_and_hide() {
    peek_log!("🔓 Unlocking widget, returning to HIDDEN");
    LOCKED_OPEN.store(false, Ordering::SeqCst);
}

/// Check if widget is locked open
pub fn is_locked() -> bool {
    LOCKED_OPEN.load(Ordering::SeqCst)
}

/// Move window to hidden position
pub fn move_to_hidden<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    let window = app.get_webview_window("main").ok_or("Window not found")?;

    let monitor = app
        .primary_monitor()
        .map_err(|e| e.to_string())?
        .ok_or("No primary monitor")?;

    let screen_width = monitor.size().width as f64;
    let screen_height = monitor.size().height as f64;
    let positions = WindowPositions::new(screen_width, screen_height);

    peek_log!(
        "📍 Moving to HIDDEN position: ({}, {})",
        positions.hidden_x as i32,
        positions.hidden_y as i32
    );

    window
        .set_position(PhysicalPosition::new(
            positions.hidden_x as i32,
            positions.hidden_y as i32,
        ))
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// Move window to peek position
pub fn move_to_peek<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    let window = app.get_webview_window("main").ok_or("Window not found")?;

    let monitor = app
        .primary_monitor()
        .map_err(|e| e.to_string())?
        .ok_or("No primary monitor")?;

    let screen_width = monitor.size().width as f64;
    let screen_height = monitor.size().height as f64;
    let positions = WindowPositions::new(screen_width, screen_height);

    peek_log!(
        "📍 Moving to PEEK position: ({}, {})",
        positions.peek_x as i32,
        positions.peek_y as i32
    );

    window
        .set_position(PhysicalPosition::new(
            positions.peek_x as i32,
            positions.peek_y as i32,
        ))
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// Starts the background monitoring thread for peek behavior.
///
/// Emits `peek:state` events when the peek state changes.
pub fn start_monitoring<R: Runtime>(app: AppHandle<R>)
where
    R: 'static,
{
    // Don't start if already monitoring
    if MONITORING_ACTIVE.swap(true, Ordering::SeqCst) {
        peek_log!("⚠️ Monitoring already active, skipping start");
        return;
    }

    peek_log!("🚀 Starting peek monitoring thread");

    std::thread::spawn(move || {
        let mut last_state = PeekState::Expanded; // Start as expanded
        let mut last_option_held = false;
        let mut last_in_corner = false;
        let mut log_counter = 0u32;

        // Get screen dimensions
        let monitor = match app.primary_monitor() {
            Ok(Some(m)) => m,
            _ => {
                peek_log!("❌ Failed to get primary monitor");
                MONITORING_ACTIVE.store(false, Ordering::SeqCst);
                return;
            }
        };

        let screen_width = monitor.size().width as f64;
        let screen_height = monitor.size().height as f64;
        let positions = WindowPositions::new(screen_width, screen_height);

        peek_log!(
            "📺 Screen: {}x{}, Corner zone: {}px from edge",
            screen_width,
            screen_height,
            CORNER_ZONE
        );
        peek_log!(
            "📐 Hidden pos: ({}, {}), Peek pos: ({}, {})",
            positions.hidden_x,
            positions.hidden_y,
            positions.peek_x,
            positions.peek_y
        );

        loop {
            if !MONITORING_ACTIVE.load(Ordering::SeqCst) {
                peek_log!("🛑 Monitoring stopped");
                break;
            }

            let option_held = macos::is_option_held();
            let (cursor_x, cursor_y) = macos::get_cursor_position();
            let in_corner = positions.is_cursor_in_corner(cursor_x, cursor_y);
            let locked = is_locked();

            // Log when Option key state changes
            if option_held != last_option_held {
                if option_held {
                    peek_log!("⌥ Option key PRESSED");
                } else {
                    peek_log!("⌥ Option key RELEASED");
                }
                last_option_held = option_held;
            }

            // Log when cursor enters/leaves corner zone
            if in_corner != last_in_corner {
                if in_corner {
                    peek_log!(
                        "🎯 Cursor ENTERED corner zone at ({:.0}, {:.0})",
                        cursor_x,
                        cursor_y
                    );
                } else {
                    peek_log!(
                        "🎯 Cursor LEFT corner zone at ({:.0}, {:.0})",
                        cursor_x,
                        cursor_y
                    );
                }
                last_in_corner = in_corner;
            }

            // Periodic position logging (every ~2 seconds when option is held)
            log_counter = log_counter.wrapping_add(1);
            if option_held && log_counter % 40 == 0 {
                peek_log!(
                    "🖱️ Cursor: ({:.0}, {:.0}) | In corner: {} | Locked: {}",
                    cursor_x,
                    cursor_y,
                    in_corner,
                    locked
                );
            }

            let current_state = if locked {
                PeekState::Expanded
            } else if option_held && in_corner {
                PeekState::Peeking
            } else {
                PeekState::Hidden
            };

            // Only update on state change
            if current_state != last_state {
                peek_log!(
                    "🔄 STATE CHANGE: {:?} → {:?} (option={}, in_corner={}, locked={})",
                    last_state,
                    current_state,
                    option_held,
                    in_corner,
                    locked
                );
                last_state = current_state;

                // Move window based on state
                let move_result = match current_state {
                    PeekState::Hidden => move_to_hidden(&app),
                    PeekState::Peeking | PeekState::Expanded => move_to_peek(&app),
                };

                if let Err(e) = move_result {
                    peek_log!("❌ Failed to move window: {}", e);
                }

                // Emit state change to frontend
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.emit("peek:state", current_state);
                    peek_log!("📤 Emitted peek:state event: {:?}", current_state);
                }
            }

            std::thread::sleep(Duration::from_millis(POLL_INTERVAL_MS));
        }
    });
}

/// Stops the background monitoring thread.
#[allow(dead_code)]
pub fn stop_monitoring() {
    MONITORING_ACTIVE.store(false, Ordering::SeqCst);
}
