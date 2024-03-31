import CreateCustomer from "../components/CreateCustomer";
import { useState } from "react";

export default function Home() {
    const [isOpen, setIsOpen] = useState(true);

    const onClose = () => {
        setIsOpen(false);
    }

    return (
        <CreateCustomer isOpen={isOpen} onClose={onClose}/>
    );
};