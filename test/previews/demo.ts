/**
 * TypeScript Semantic Token Demonstration
 * This file showcases various semantic token types
 */
/** biome-ignore-all lint: <demo> */

// Interfaces and Types
interface User { // [semantic: interface.declaration]
  readonly id: number; // [semantic: property.readonly]
  name: string; // [semantic: property]
  email: string; // [semantic: property]
  role: UserRole; // [semantic: property + type]
}

type UserRole = 'admin' | 'user' | 'guest'; // [semantic: type.declaration]

enum Status { // [semantic: enum.declaration]
  Active, // [semantic: enumMember]
  Inactive, // [semantic: enumMember]
  Pending // [semantic: enumMember]
}

// Classes
class UserManager { // [semantic: class.declaration]
  private users: Map<number, User>; // [semantic: property.private]
  private static instance: UserManager; // [semantic: property.static.private]

  constructor() { // [semantic: method.declaration]
    this.users = new Map(); // [semantic: property access]
  }

  public static getInstance(): UserManager { // [semantic: method.static.declaration]
    if (!UserManager.instance) { // [semantic: class + property.static]
      UserManager.instance = new UserManager(); // [semantic: class + property.static]
    }
    return UserManager.instance; // [semantic: class + property.static]
  }

  public addUser(user: User): void { // [semantic: method.declaration + parameter]
    this.users.set(user.id, user); // [semantic: property + method + parameter + property]
  }

  public getUser(id: number): User | undefined { // [semantic: method.declaration + parameter + type]
    return this.users.get(id); // [semantic: property + method + parameter]
  }

  private validateUser(user: User): boolean { // [semantic: method.private.declaration + parameter + type]
    return user.name.length > 0 && user.email.includes('@'); // [semantic: parameter + property access]
  }
}

// Functions
function createUser(name: string, email: string, role: UserRole = 'user'): User { // [semantic: function.declaration + parameters + type]
  return {
    id: Math.floor(Math.random() * 1000), // [semantic: property + function + number]
    name, // [semantic: property + parameter]
    email, // [semantic: property + parameter]
    role // [semantic: property + parameter]
  };
}

async function fetchUserData(userId: number): Promise<User | null> { // [semantic: function.async.declaration + parameter + type]
  try {
    const response = await fetch(`/api/users/${userId}`); // [semantic: variable.declaration + function + parameter]
    const data = await response.json(); // [semantic: variable.declaration + variable + method]
    return data as User; // [semantic: variable + type]
  } catch (error) { // [semantic: variable.declaration]
    console.error('Failed to fetch user:', error); // [semantic: variable + method + string + variable]
    return null; // [semantic: keyword]
  }
}

// Decorators
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) { // [semantic: function.declaration.decorator + parameters + type]
  const originalMethod = descriptor.value; // [semantic: variable.declaration + parameter + property]
  descriptor.value = function(...args: any[]) { // [semantic: parameter + property + parameter]
    console.log(`Calling ${propertyKey} with`, args); // [semantic: variable + method + parameter + parameter]
    return originalMethod.apply(this, args); // [semantic: variable + method + parameter]
  };
}

// Generic functions
function findById<T extends { id: number }>(items: T[], id: number): T | undefined { // [semantic: function.declaration + typeParameter + parameters + type]
  return items.find(item => item.id === id); // [semantic: parameter + method + parameter + property + parameter]
}

// Constants and variables
const MAX_USERS = 100; // [semantic: variable.readonly.declaration + number]
const DEFAULT_ROLE: UserRole = 'user'; // [semantic: variable.readonly.declaration + type + string]
let currentUser: User | null = null; // [semantic: variable.declaration + type + keyword]

// Usage
const manager = UserManager.getInstance(); // [semantic: variable.readonly.declaration + class + method.static]
const newUser = createUser('John Doe', 'john@example.com', 'admin'); // [semantic: variable.readonly.declaration + function + strings]
manager.addUser(newUser); // [semantic: variable + method + variable]

// Arrow functions and callbacks
const users: User[] = []; // [semantic: variable.readonly.declaration + type]
users.forEach((user) => console.log(user.name)); // [semantic: variable + method + parameter + variable + method + parameter + property]
users.filter((user) => user.role === 'admin'); // [semantic: variable + method + parameter + parameter + property + string]
users.map((user) => ({ ...user, active: true })); // [semantic: variable + method + parameter + parameter + property]

// Template literals
const greeting = `Hello, ${newUser.name}!`; // [semantic: variable.readonly.declaration + string + variable + property]
const message = `User ${newUser.id} has role: ${newUser.role}`; // [semantic: variable.readonly.declaration + string + variable + properties]

// Namespace
namespace Utils { // [semantic: namespace.declaration]
  export function formatDate(date: Date): string { // [semantic: function.declaration + parameter + type]
    return date.toISOString(); // [semantic: parameter + method]
  }

  export const APP_VERSION = '1.0.0'; // [semantic: variable.readonly.declaration + string]
}

export { UserManager, createUser, fetchUserData };
export type { User, UserRole };
