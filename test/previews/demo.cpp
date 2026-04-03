/**
 * C++ Semantic Token Demonstration
 * Showcases semantic highlighting for modern C++ code
 */

#include <iostream>
#include <vector>
#include <memory>
#include <string>
#include <algorithm>
#include <optional>
#include <map>
#include <functional>

// Forward declarations
class User;
template<typename T> class Container;

// Enums
enum class UserRole {
    Admin,
    Moderator,
    User,
    Guest
};

enum Status : int {
    STATUS_ACTIVE = 1,
    STATUS_INACTIVE = 0,
    STATUS_PENDING = 2
};

// Namespace
namespace Demo {
    // Constants
    constexpr int MAX_USERS = 100;
    constexpr double PI = 3.14159265359;
    const std::string DEFAULT_NAME = "Unknown";

    // Type aliases
    using UserId = uint64_t;
    using UserPtr = std::shared_ptr<User>;
    using UserMap = std::map<UserId, UserPtr>;

    // Structures
    struct UserInfo {
        std::string name;
        std::string email;
        UserRole role;
        bool active;

        UserInfo(const std::string& n, const std::string& e, UserRole r)
            : name(n), email(e), role(r), active(true) {}
    };

    // Class definition with various member types
    class User {
    private:
        static UserId nextId;
        UserId id;
        std::string name;
        std::string email;
        UserRole role;
        bool active;

    public:
        // Constructors
        User() : id(nextId++), name(DEFAULT_NAME), email(""),
                role(UserRole::Guest), active(true) {}

        User(const std::string& name, const std::string& email, UserRole role)
            : id(nextId++), name(name), email(email), role(role), active(true) {}

        // Copy constructor
        User(const User& other)
            : id(nextId++), name(other.name), email(other.email),
              role(other.role), active(other.active) {}

        // Move constructor
        User(User&& other) noexcept
            : id(other.id), name(std::move(other.name)),
              email(std::move(other.email)), role(other.role),
              active(other.active) {}

        // Virtual destructor
        virtual ~User() = default;

        // Getters
        UserId getId() const { return id; }
        const std::string& getName() const { return name; }
        const std::string& getEmail() const { return email; }
        UserRole getRole() const { return role; }
        bool isActive() const { return active; }

        // Setters
        void setName(const std::string& newName) { name = newName; }
        void setEmail(const std::string& newEmail) { email = newEmail; }
        void setRole(UserRole newRole) { role = newRole; }
        void deactivate() { active = false; }
        void activate() { active = true; }

        // Virtual methods
        virtual void display() const {
            std::cout << "User{id=" << id << ", name=" << name
                     << ", email=" << email << "}" << std::endl;
        }

        virtual bool hasPermission(const std::string& permission) const {
            return role == UserRole::Admin;
        }

        // Static methods
        static UserId getNextId() { return nextId; }
        static void resetIdCounter() { nextId = 1; }

        // Friend function
        friend std::ostream& operator<<(std::ostream& os, const User& user);

        // Operator overloads
        User& operator=(const User& other) {
            if (this != &other) {
                name = other.name;
                email = other.email;
                role = other.role;
                active = other.active;
            }
            return *this;
        }

        bool operator==(const User& other) const {
            return id == other.id;
        }
    };

    // Initialize static member
    UserId User::nextId = 1;

    // Derived class
    class AdminUser : public User {
    private:
        std::vector<std::string> permissions;

    public:
        AdminUser(const std::string& name, const std::string& email)
            : User(name, email, UserRole::Admin) {}

        void addPermission(const std::string& permission) {
            permissions.push_back(permission);
        }

        void removePermission(const std::string& permission) {
            permissions.erase(
                std::remove(permissions.begin(), permissions.end(), permission),
                permissions.end()
            );
        }

        // Override virtual method
        void display() const override {
            User::display();
            std::cout << "Permissions: ";
            for (const auto& perm : permissions) {
                std::cout << perm << " ";
            }
            std::cout << std::endl;
        }

        bool hasPermission(const std::string& permission) const override {
            return std::find(permissions.begin(), permissions.end(), permission)
                   != permissions.end();
        }
    };

    // Template class
    template<typename T>
    class Container {
    private:
        std::vector<T> items;
        size_t maxSize;

    public:
        explicit Container(size_t max = MAX_USERS) : maxSize(max) {}

        bool add(const T& item) {
            if (items.size() < maxSize) {
                items.push_back(item);
                return true;
            }
            return false;
        }

        std::optional<T> get(size_t index) const {
            if (index < items.size()) {
                return items[index];
            }
            return std::nullopt;
        }

        size_t size() const { return items.size(); }

        void forEach(const std::function<void(const T&)>& func) const {
            for (const auto& item : items) {
                func(item);
            }
        }

        template<typename Predicate>
        std::vector<T> filter(Predicate pred) const {
            std::vector<T> result;
            std::copy_if(items.begin(), items.end(),
                        std::back_inserter(result), pred);
            return result;
        }
    };

    // Free functions
    std::ostream& operator<<(std::ostream& os, const User& user) {
        os << "User(" << user.id << ", " << user.name << ")";
        return os;
    }

    bool validateEmail(const std::string& email) {
        return email.find('@') != std::string::npos;
    }

    UserPtr createUser(const std::string& name, const std::string& email,
                      UserRole role = UserRole::User) {
        return std::make_shared<User>(name, email, role);
    }

    // Template functions
    template<typename T>
    void printContainer(const Container<T>& container) {
        std::cout << "Container size: " << container.size() << std::endl;
    }

    template<typename T, typename Predicate>
    std::optional<T> findIf(const std::vector<T>& items, Predicate pred) {
        auto it = std::find_if(items.begin(), items.end(), pred);
        if (it != items.end()) {
            return *it;
        }
        return std::nullopt;
    }

    // Lambda and function objects
    auto makeUserFilter(UserRole role) {
        return [role](const UserPtr& user) {
            return user->getRole() == role;
        };
    }
}

// Main function
int main(int argc, char* argv[]) {
    using namespace Demo;

    // Create container
    Container<UserPtr> userContainer(MAX_USERS);

    // Create users
    auto admin = std::make_shared<AdminUser>("Alice", "alice@example.com");
    admin->addPermission("read");
    admin->addPermission("write");
    admin->addPermission("delete");

    auto moderator = createUser("Bob", "bob@example.com", UserRole::Moderator);
    auto regularUser = createUser("Charlie", "charlie@example.com", UserRole::User);

    // Add to container
    userContainer.add(admin);
    userContainer.add(moderator);
    userContainer.add(regularUser);

    // Lambda expressions
    userContainer.forEach([](const UserPtr& user) {
        std::cout << *user << std::endl;
    });

    // Range-based for loop
    std::vector<UserPtr> allUsers = {admin, moderator, regularUser};
    for (const auto& user : allUsers) {
        user->display();
    }

    // Algorithm usage
    auto adminCount = std::count_if(allUsers.begin(), allUsers.end(),
        [](const UserPtr& user) {
            return user->getRole() == UserRole::Admin;
        }
    );

    std::cout << "Admin count: " << adminCount << std::endl;

    // Smart pointer operations
    std::weak_ptr<User> weakUser = moderator;
    if (auto sharedUser = weakUser.lock()) {
        std::cout << "User still exists: " << sharedUser->getName() << std::endl;
    }

    // Optional handling
    auto maybeUser = userContainer.get(0);
    if (maybeUser.has_value()) {
        std::cout << "Found user: " << *maybeUser.value() << std::endl;
    }

    // Template function usage
    printContainer(userContainer);

    // Exception handling
    try {
        if (!validateEmail("invalid-email")) {
            throw std::runtime_error("Invalid email format");
        }
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }

    return 0;
}
