import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface ContactsContextProps {
  contacts: Contact[];
  addContact: (contact: Contact) => void;
}

const ContactsContext = createContext<ContactsContextProps | undefined>(undefined);

export const ContactsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  const addContact = (contact: Contact) => {
    setContacts((prevContacts) => [...prevContacts, contact]);
  };

  return (
    <ContactsContext.Provider value={{ contacts, addContact }}>
      {children}
    </ContactsContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error('useContacts must be used within a ContactsProvider');
  }
  return context;
};