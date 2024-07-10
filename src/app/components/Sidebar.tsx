"use client"
import { Timestamp, addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { BiLogOut } from 'react-icons/bi'
import { auth, db } from '../firebase'
import { useAppContext } from '@/context/AppContext'



type Room = {
    id: string;
    name: string;
    createdAt: Timestamp;
}

const Sidebar = () => {

    const { user, userId, setSelectedRoom, setSelectedRoomName } = useAppContext();


    const [rooms, setRooms] = useState<Room[]>([]);


    useEffect(() => {
        if (user) {
            const fetchRooms = async () => {
                const roomCollectionRef = collection(db, "rooms");
                const q = query(roomCollectionRef, where("userId", "==", userId), orderBy("createdAt"));
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const newRooms: Room[] = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        name: doc.data().name,
                        createdAt: doc.data().createdAt,
                    }))
                    setRooms(newRooms);

                    return () => {
                        unsubscribe();
                    }

                })
            }
            fetchRooms();

        }
    }, [userId]);

    const selectRoom = (roomId: string,roomName: string) => {
        setSelectedRoom(roomId);
        setSelectedRoomName(roomName)
    }

    const addNewRoom = async () => {
        const roomName = prompt("ルーム名を入力してください")
        if (roomName) {
            const newRoomRef = collection(db, "rooms");
            await addDoc(newRoomRef, {
                name: roomName,
                userId: userId,
                createdAt: serverTimestamp(),
            })
        }
    }

    const handleLogout = () => {
        auth.signOut();
    }

    return (
        <div className='bg-custom-blue h-full overflow-y-auto px-5 flex flex-col'>
            <div className='flex-grow'>
                <div
                    className='flex justify-evenly items-center border 
                mt-2 rounded-md cursor-pointer hover:bg-blue-800  duration-150 '
                    onClick={addNewRoom}
                >
                    <span className='text-white p-4 text-2xl'>＋</span>
                    <h1 className='text-white text-xl font-semibold'>New Chat</h1>
                </div>

                <ul>
                    {rooms.map((room) => (
                        <li
                            key={room.id}
                            className=' border-b p-4 text-slate-100 
                        hover:bg-slate-700 cursol-pointer duration-150'
                            onClick={() => selectRoom(room.id,room.name)}
                        >
                            {room.name}
                        </li>
                    ))}

                    {/* <li className=' border-b p-4 text-slate-100 
                        hover:bg-slate-700 cursol-pointer duration-150'
                    >
                        Room2
                    </li>
                    <li className=' border-b p-4 text-slate-100 
                        hover:bg-slate-700 cursol-pointer duration-150'
                    >
                        Room3
                    </li>
                    <li className=' border-b p-4 text-slate-100 
                        hover:bg-slate-700 cursol-pointer duration-150'
                    >
                        Room4
                    </li> */}
                </ul>
            </div>

            {user && (
                <div className='mb-2 p-4 text-lg text-slate-100 '>
                    {user.email}
                </div>
            )}
            <div
                onClick={()=>handleLogout}
                className='text-lg flex items-center justify-evenly mb-2 cursor-pointer p-3 text-slate-100 hover:bg-slate-700 duration-150'
            >
                <BiLogOut />
                <span>ログアウト</span>
            </div>
        </div >
    )
}

export default Sidebar