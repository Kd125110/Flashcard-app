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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const userId = getUserIdFromToken();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token || !userId) return;

      try {
        const response = await fetch(`http://localhost:3001/api/auth/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setEmail(data.email);
        } else {
          setMessage(data.message || "Nie udało się pobrać danych użytkownika");
        }
      } catch (error) {
        console.error("Błąd podczas łaczenia", error);
        setMessage("Błąd połączenia z serwerem");
      }
    };

    fetchUserData();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setMessage("Nie można pobrać ID użytkownika");
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
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Dane zaktualizowane");
      } else {
        setMessage(data.message || "Wystąpił błąd");
      }
    } catch (error) {
      console.error("Błąd podczas łaczenia", error);
      setMessage("Błąd połączenia z serwerem");
    }
  };

  return (
    <div>
      <Navbar />
      <h1 className="mb-10">Panel użytkownika</h1>
      <div className="w-full max-w-xs">
        <form
          className="bg-gray-100 shadow-md rounded px-8 pt-6 mb-4"
          onSubmit={handleSubmit}
          role="form"
        >
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold">Email:</label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold">Hasło:</label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="items-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-5 mt-5"
              type="submit"
            >
              Zapisz zmiany
            </button>
          </div>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default UserSettingPage;
