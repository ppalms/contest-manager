'use client';

import { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { GraphQLResult } from '@aws-amplify/api';
import { listUsers } from '@/graphql/resolvers/queries';
import { getAuthHeader } from '@/helpers';
import UserList from '@/components/UserList';

export default function UserIndex() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const authHeader = await getAuthHeader();
      const result: GraphQLResult<any> = await API.graphql(
        graphqlOperation(listUsers),
        authHeader
      );
      setUsers(result.data.listUsers);
    };
    fetchUsers();
  }, []);

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <UserList users={users} />
      </div>
    </>
  );
}
