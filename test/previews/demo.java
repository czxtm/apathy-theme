/**
 * Java Semantic Token Demonstration
 * Showcases semantic highlighting for Java code
 */

package com.example.demo; // [semantic: namespace]

import java.util.*; // [semantic: namespace import]
import java.util.stream.Collectors; // [semantic: namespace import]

// Annotations
@SuppressWarnings("unchecked") // [semantic: decorator + string]
@Deprecated // [semantic: decorator]
public class SemanticTokenDemo { // [semantic: class.declaration]

    // Static fields
    private static final int MAX_CAPACITY = 100; // [semantic: property.static.readonly + number]
    private static final String DEFAULT_NAME = "Unknown"; // [semantic: property.static.readonly + string]

    // Instance fields
    private final List<User> users; // [semantic: property.readonly + type]
    private int currentIndex; // [semantic: property.private]
    protected String description; // [semantic: property.protected]

    // Nested enum
    public enum UserType { // [semantic: enum.declaration]
        ADMIN(10), // [semantic: enumMember + number]
        MODERATOR(5), // [semantic: enumMember + number]
        REGULAR(1); // [semantic: enumMember + number]

        private final int priority; // [semantic: property.readonly]

        UserType(int priority) { // [semantic: method.declaration + parameter]
            this.priority = priority; // [semantic: property + parameter]
        }

        public int getPriority() { // [semantic: method.declaration + type]
            return priority; // [semantic: property]
        }
    }

    // Nested class
    public static class User { // [semantic: class.static.declaration]
        private final String name; // [semantic: property.readonly]
        private final String email; // [semantic: property.readonly]
        private UserType type; // [semantic: property + type]

        public User(String name, String email, UserType type) { // [semantic: method.declaration + parameters + type]
            this.name = name; // [semantic: property + parameter]
            this.email = email; // [semantic: property + parameter]
            this.type = type; // [semantic: property + parameter]
        }

        public String getName() { // [semantic: method.declaration + type]
            return name; // [semantic: property]
        }

        public String getEmail() { // [semantic: method.declaration + type]
            return email; // [semantic: property]
        }

        public UserType getType() { // [semantic: method.declaration + type]
            return type; // [semantic: property]
        }

        public void setType(UserType type) { // [semantic: method.declaration + parameter + type]
            this.type = type; // [semantic: property + parameter]
        }

        @Override // [semantic: decorator]
        public String toString() { // [semantic: method.declaration + type]
            return String.format("User{name='%s', email='%s', type=%s}", // [semantic: type + method + string]
                               name, email, type); // [semantic: properties]
        }
    }

    // Constructor
    public SemanticTokenDemo() { // [semantic: method.declaration.constructor]
        this.users = new ArrayList<>(); // [semantic: property + type]
        this.currentIndex = 0; // [semantic: property + number]
        this.description = "Demo Instance"; // [semantic: property + string]
    }

    // Methods
    public void addUser(User user) { // [semantic: method.declaration + parameter + type]
        if (users.size() < MAX_CAPACITY) { // [semantic: property + method + property]
            users.add(user); // [semantic: property + method + parameter]
        } else {
            throw new IllegalStateException("Capacity reached"); // [semantic: keyword + type + string]
        }
    }

    public Optional<User> findUserByName(String name) { // [semantic: method.declaration + type + parameter + type]
        return users.stream() // [semantic: property + method]
                   .filter(user -> user.getName().equals(name)) // [semantic: method + parameter + parameter + method + parameter]
                   .findFirst(); // [semantic: method]
    }

    public List<User> getUsersByType(UserType type) { // [semantic: method.declaration + type + parameter + type]
        return users.stream() // [semantic: property + method]
                   .filter(user -> user.getType() == type) // [semantic: method + parameter + parameter + method + parameter]
                   .collect(Collectors.toList()); // [semantic: method + type + method]
    }

    private boolean validateEmail(String email) { // [semantic: method.private.declaration + parameter + type]
        return email != null && email.contains("@"); // [semantic: parameter + keyword + parameter + method + string]
    }

    protected void updateDescription(String newDescription) { // [semantic: method.protected.declaration + parameter + type]
        this.description = newDescription; // [semantic: property + parameter]
    }

    // Static method
    public static SemanticTokenDemo createDemo() { // [semantic: method.static.declaration + type]
        return new SemanticTokenDemo(); // [semantic: keyword + type]
    }

    // Generic method
    public <T> List<T> convertList(List<User> users, UserConverter<T> converter) { // [semantic: method.declaration + typeParameter + type + parameters + type]
        List<T> result = new ArrayList<>(); // [semantic: type + variable + type]
        for (User user : users) { // [semantic: type + variable + parameter]
            result.add(converter.convert(user)); // [semantic: variable + method + parameter + method + variable]
        }
        return result; // [semantic: variable]
    }

    // Functional interface
    @FunctionalInterface // [semantic: decorator]
    public interface UserConverter<T> { // [semantic: interface.declaration + typeParameter]
        T convert(User user); // [semantic: method.declaration + type + parameter]
    }

    // Main method with various token types
    public static void main(String[] args) { // [semantic: method.static.declaration + parameter + type]
        SemanticTokenDemo demo = new SemanticTokenDemo(); // [semantic: type + variable + type]

        // Creating users with different types
        User admin = new User("Alice", "alice@example.com", UserType.ADMIN); // [semantic: type + variable + type + strings + enum + enumMember]
        User moderator = new User("Bob", "bob@example.com", UserType.MODERATOR); // [semantic: type + variable + type + strings + enum + enumMember]
        User regular = new User("Charlie", "charlie@example.com", UserType.REGULAR); // [semantic: type + variable + type + strings + enum + enumMember]

        // Adding users
        demo.addUser(admin); // [semantic: variable + method + variable]
        demo.addUser(moderator); // [semantic: variable + method + variable]
        demo.addUser(regular); // [semantic: variable + method + variable]

        // Lambda expressions
        List<String> names = demo.users.stream() // [semantic: type + variable + variable + property + method]
                                      .map(User::getName) // [semantic: method + type + method]
                                      .collect(Collectors.toList()); // [semantic: method + type + method]

        // Method references
        demo.users.forEach(System.out::println); // [semantic: variable + property + method + type + property + method]

        // Conditionals and loops
        for (User user : demo.users) { // [semantic: type + variable + variable + property]
            if (user.getType() == UserType.ADMIN) { // [semantic: variable + method + enum + enumMember]
                System.out.println("Admin user: " + user.getName()); // [semantic: type + property + method + string + variable + method]
            } else if (user.getType() == UserType.MODERATOR) { // [semantic: variable + method + enum + enumMember]
                System.out.println("Moderator user: " + user.getName()); // [semantic: type + property + method + string + variable + method]
            } else {
                System.out.println("Regular user: " + user.getName()); // [semantic: type + property + method + string + variable + method]
            }
        }

        // Try-catch blocks
        try {
            Optional<User> found = demo.findUserByName("Alice"); // [semantic: type + variable + variable + method + string]
            found.ifPresent(user -> System.out.println("Found: " + user)); // [semantic: variable + method + parameter + type + property + method + string + parameter]
        } catch (Exception e) { // [semantic: type + variable]
            System.err.println("Error: " + e.getMessage()); // [semantic: type + property + method + string + variable + method]
        } finally {
            System.out.println("Search completed"); // [semantic: type + property + method + string]
        }
    }
}
