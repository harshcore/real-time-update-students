import React, { useState, useEffect } from "react";
import {
  useQuery,
  useQueryClient,
  useMutation,
  QueryClient,
  QueryClientProvider,
} from "react-query";
import axios from "axios";
import io from "socket.io-client";

const BASE_URL = "https://friendly-sedate-duckling.glitch.me";

// Create a client
const queryClient = new QueryClient();

// const UsersList = () => {
//   const [page, setPage] = useState(1);
//   const [newUser, setNewUser] = useState({ name: "", email: "" });
//   const queryClient = useQueryClient();

//   // Function to fetch users
//   const fetchUsers = async ({ queryKey }) => {
//     const [, { page }] = queryKey;
//     const response = await axios.get(
//       `${BASE_URL}/api/users?page=${page}&limit=10`
//     );
//     return response.data;
//   };

//   // Query hook
//   const { data, isLoading, error } = useQuery(["users", { page }], fetchUsers, {
//     keepPreviousData: true,
//   });

//   // Mutation hook for adding a new user
//   const addUserMutation = useMutation(
//     (userData) => axios.post(`${BASE_URL}/api/users`, userData),
//     {
//       onSuccess: () => {
//         queryClient.invalidateQueries("users");
//         setNewUser({ name: "", email: "" });
//       },
//     }
//   );

//   // Real-time updates with Socket.IO
//   useEffect(() => {
//     const socket = io(`${BASE_URL}`);

//     socket.on("newUser", (newUser) => {
//       queryClient.setQueryData(["users", { page: 1 }], (oldData) => {
//         if (oldData) {
//           return {
//             ...oldData,
//             users: [newUser, ...oldData.users.slice(0, -1)],
//             totalCount: oldData.totalCount + 1,
//           };
//         }
//         return oldData;
//       });
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [queryClient]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     addUserMutation.mutate(newUser);
//   };

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.message}</div>;

//   return (
//     <div>
//       <h1>User Registration</h1>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="Name"
//           value={newUser.name}
//           onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
//           required
//         />
//         <input
//           type="email"
//           placeholder="Email"
//           value={newUser.email}
//           onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
//           required
//         />
//         <button type="submit">Register</button>
//       </form>

//       <h2>Registered Users</h2>
//       <ul>
//         {data.users.map((user) => (
//           <li key={user.id}>
//             {user.name} - {user.email}
//           </li>
//         ))}
//       </ul>
//       <div>
//         <button
//           onClick={() => setPage((old) => Math.max(old - 1, 1))}
//           disabled={page === 1}
//         >
//           Previous Page
//         </button>
//         <span>Page {page}</span>
//         <button
//           onClick={() => setPage((old) => old + 1)}
//           disabled={!data.hasMore}
//         >
//           Next Page
//         </button>
//       </div>
//     </div>
//   );
// };

const UsersList = () => {
  const [page, setPage] = useState(1);
  const [newUser, setNewUser] = useState({ name: "", email: "" });
  const queryClient = useQueryClient();

  // Fetch users function
  const fetchUsers = async ({ queryKey }) => {
    const [, { page }] = queryKey;
    const response = await axios.get(
      `${BASE_URL}/api/users?page=${page}&limit=10`
    );
    return response.data;
  };

  // Query hook
  const { data, isLoading, error } = useQuery(["users", { page }], fetchUsers, {
    keepPreviousData: true,
  });

  // Mutation hook for adding a new user
  const addUserMutation = useMutation(
    (userData) => axios.post(`${BASE_URL}/api/users`, userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("users");
        setNewUser({ name: "", email: "" });
      },
    }
  );

  // Mutation hook for deleting a user
  const deleteUserMutation = useMutation(
    (userId) => axios.post(`${BASE_URL}/api/users/delete/${userId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("users");
      },
    }
  );

  // Real-time updates with Socket.IO
  useEffect(() => {
    const socket = io(`${BASE_URL}`);

    socket.on("newUser", (newUser) => {
      queryClient.setQueryData(["users", { page: 1 }], (oldData) => {
        if (oldData) {
          return {
            ...oldData,
            users: [newUser, ...oldData.users.slice(0, -1)],
            totalCount: oldData.totalCount + 1,
          };
        }
        return oldData;
      });
    });

    socket.on("deleteUser", (deletedUser) => {
      queryClient.setQueryData(["users", { page }], (oldData) => {
        if (oldData) {
          return {
            ...oldData,
            users: oldData.users.filter((user) => user.id !== deletedUser.id),
            totalCount: oldData.totalCount - 1,
          };
        }
        return oldData;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  const handleSubmit = (e) => {
    e.preventDefault();
    addUserMutation.mutate(newUser);
  };

  const handleDelete = (userId) => {
    deleteUserMutation.mutate(userId);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>User Registration</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          required
        />
        <button type="submit">Register</button>
      </form>

      <h2>Registered Users</h2>
      <ul>
        {data.users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}{" "}
            <button onClick={() => handleDelete(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <div>
        <button
          onClick={() => setPage((old) => Math.max(old - 1, 1))}
          disabled={page === 1}
        >
          Previous Page
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage((old) => old + 1)}
          disabled={!data.hasMore}
        >
          Next Page
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UsersList />
    </QueryClientProvider>
  );
}

export default App;
