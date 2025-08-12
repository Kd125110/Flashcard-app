import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
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

const UserSettingPage: React.FC = () => {
  const [name , setName] = useState("");
  const [surname, setSurname] = useState("")
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

    if (!userId) {
      setMessage("Nie można pobrać ID użytkownika");
      setMessageType("error");
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-500 text-white py-4 px-6">
              <h1 className="text-2xl font-bold">Panel użytkownika</h1>
              {userData.name && userData.surname && (
                <p className="mt-1 text-blue-100">
                  {userData.name} {userData.surname}
                </p>
              )}
            </div>
            
            <div className="p-6">
              {isLoading && !email ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} role="form">
                    <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                      Imie
                    </label>
                    <input
                      id="name"
                      className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      type="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder='Pozostaw puste, aby nie zmieniać'
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Wprowadź imie tylko jeśli chcesz je zmienić
                    </p>
                  </div>
                   <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="surname">
                      Nazwisko
                    </label>
                    <input
                      id="surname"
                      className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      type="surname"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      placeholder="Pozostaw puste, aby nie zmieniać"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Wprowadź nazwisko tylko jeśli chcesz je zmienić
                    </p>
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                      Adres email
                    </label>
                    <input
                      id="email"
                      className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="twój@email.com"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                      Nowe hasło
                    </label>
                    <input
                      id="password"
                      className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Pozostaw puste, aby nie zmieniać"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Wprowadź nowe hasło tylko jeśli chcesz je zmienić
                    </p>
                  </div>
                  
                  {message && (
                    <div className={`mb-6 p-3 rounded-md ${
                      messageType === "success" ? "bg-green-100 text-green-800" : 
                      messageType === "error" ? "bg-red-100 text-red-800" : ""
                    }`}>
                      {message}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <button
                      className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ${
                        isLoading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Zapisywanie...
                        </span>
                      ) : "Zapisz zmiany"}
                    </button>
                    
                    <button
                      type="button"
                      className="text-gray-600 hover:text-gray-800 font-medium transition duration-200"
                      onClick={() => {
                        setPassword("");
                        setMessage("");
                      }}
                    >
                      Anuluj
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Masz problem z kontem? <a href="#" className="text-blue-500 hover:text-blue-700">Skontaktuj się z nami</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingPage;