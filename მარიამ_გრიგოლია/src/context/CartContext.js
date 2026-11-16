import { createContext } from "react";
//we created an interface which determines the shape of the context value, which will be provided to the components that consume this context.
//addItem: (product: Product, quantity: number) => void; this is a function that takes a product(Product component) and quantity(number) as arguments and adds the item to the cart.
//void doesn't return anything, it just performs the action of adding the item to the cart.
export const CartContext = createContext(null);
//by that line we create context box which either will be CartContextValue or null, and we set the default value to null.
// This means that if a component tries to consume the context without being wrapped in a provider, it will receive null as the context value.
