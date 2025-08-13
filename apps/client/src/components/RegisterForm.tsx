import React from 'react';

interface RegisterFormProps {
  name: string;
  surname: string;
  email: string;
  password: string;
  message: string;
  isSubmitting: boolean;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSurnameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onLoginClick: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  name,
  surname,
  email,
  password,
  message,
  isSubmitting,
  onNameChange,
  onSurnameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onLoginClick
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Utwórz konto</h1>
          <p className="text-gray-600 mt-2">Dołącz do nas, aby zacząć tworzyć i uczyć się z fiszkami</p>
        </div>
        
        <form 
          className="bg-white p-8 rounded-lg shadow-lg border border-gray-100" 
          onSubmit={onSubmit}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Rejestracja</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Imię</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="name"
                  className="p-3 pl-10 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                  type="text"
                  placeholder="Podaj imię"
                  value={name}
                  onChange={onNameChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
              <input
                id="surname"
                className="p-3 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                type="text"
                placeholder="Podaj nazwisko"
                value={surname}
                onChange={onSurnameChange}
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Adres email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                id="email"
                className="p-3 pl-10 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                type="email"
                placeholder="Podaj adres email"
                value={email}
                onChange={onEmailChange}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Hasło</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="password"
                className="p-3 pl-10 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                type="password"
                placeholder="Utwórz silne hasło"
                value={password}
                onChange={onPasswordChange}
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Hasło musi mieć co najmniej 6 znaków</p>
          </div>
          
          {message && (
            <div className={`mb-4 p-3 ${message.includes('zakończona pomyślnie') ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'} rounded-md flex items-center border`}>
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {message}
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                Akceptuję <a href="#" className="text-blue-600 hover:text-blue-500">Regulamin</a> oraz <a href="#" className="text-blue-600 hover:text-blue-500">Politykę prywatności</a>
              </label>
            </div>
          </div>
          
          <button 
            className={`w-full p-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-base ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Rejestracja...
              </span>
            ) : 'Utwórz konto'}
          </button>
          
          <div className="mt-4 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Lub</span>
            </div>
          </div>
          
          <button 
            className="mt-4 w-full p-3 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition-colors border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-base flex items-center justify-center"
            type="button" 
            onClick={onLoginClick}
          >
            Masz już konto? Zaloguj się
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Potrzebujesz pomocy? <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Skontaktuj się z nami</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;