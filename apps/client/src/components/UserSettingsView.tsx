import React from "react";

interface UserSettingsViewProps {
  name: string;
  setName: (name: string) => void;
  surname: string;
  setSurname: (surname: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  message: string;
  messageType: "success" | "error" | "";
  isLoading: boolean;
  userData: {name?: string; surname?: string};
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleCancel: () => void;
}

const UserSettingsView: React.FC<UserSettingsViewProps> = ({
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
}) => {
  return (
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
                    onClick={handleCancel}
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
  );
};

export default UserSettingsView;