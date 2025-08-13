import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  userId: number;
  name: string;
  surname: string;
  email: string;
  exp: number;
  iat: number;
}

export const getUserIdFromToken = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      console.warn("Token wygasł");
      localStorage.removeItem("authToken");
      return null;
    }
    return decoded.userId;
  } catch (error) {
    console.error("Błąd dekodowania tokena", error);
    return null;
  }
};

export const useUserSettings = () => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<{name?: string; surname?: string}>({});
  const userId = getUserIdFromToken();

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/api/auth/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setName(data.name);
          setSurname(data.surname);
          setEmail(data.email);
          setUserData({
            name: data.name,
            surname: data.surname
          });
        } else {
          setMessage(data.message || "Nie udało się pobrać danych użytkownika");
          setMessageType("error");
        }
      } catch (error) {
        console.error("Błąd podczas łaczenia", error);
        setMessage("Błąd połączenia z serwerem");
        setMessageType("error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setMessageType('');

    if (!userId) {
      setMessage("Nie można pobrać ID użytkownika");
      setMessageType("error");
      setIsLoading(false);
      return;
    }
    
    if(email && !email.includes('@')){
      setMessage('Nie poprawny adres email');
      setMessageType('error');
      setIsLoading(false);
      return;
    }
    
    if(password && password.length < 6){
      setMessage('Hasło musi mieć co najmniej 6 znaków');
      setMessageType('error');
      setIsLoading(false);
      return;
    }
    
    const nameRegex = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]*$/;
    if(name && !nameRegex.test(name)){
      setMessage('Imię zawiera niedozwolone znaki');
      setMessageType('error');
      setIsLoading(false);
      return;
    }
    
    if(surname && !nameRegex.test(surname)){
      setMessage('Nazwisko zawiera niedozwolone znaki');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(`http://localhost:3001/api/auth/edit/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({name, surname, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Dane zostały pomyślnie zaktualizowane");
        setMessageType("success");
        setPassword(""); // Clear password field after successful update
      } else {
        setMessage(data.message || "Wystąpił błąd podczas aktualizacji danych");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Błąd podczas łaczenia", error);
      setMessage("Błąd połączenia z serwerem");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPassword("");
    setMessage("");
  };

  return {
    name,
    setName,
    surname,
    setSurname,
    email,
    setEmail,
    password,
    setPassword,
    message,
    messageType,
    isLoading,
    userData,
    handleSubmit,
    handleCancel
  };
};