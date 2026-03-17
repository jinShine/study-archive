/**
 * User 인터페이스: 서버에서 내려주는 방대한 양의 날것 데이터 규격
 */
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  address: {
    city: string;
    street: string;
    zipcode: string;
  };
}

export const fetchUsers = async (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Gemini', email: 'ai@google.com', phone: '010-1234', isActive: true, address: { city: 'Seoul', street: 'Tech-ro', zipcode: '123' } },
        { id: 2, name: 'React', email: 'fb@meta.com', phone: '010-5678', isActive: false, address: { city: 'Palo Alto', street: 'Hacker Way', zipcode: '456' } },
        { id: 3, name: 'TypeScript', email: 'ms@microsoft.com', phone: '010-9999', isActive: true, address: { city: 'Redmond', street: 'One MS Way', zipcode: '789' } },
      ]);
    }, 500);
  });
};