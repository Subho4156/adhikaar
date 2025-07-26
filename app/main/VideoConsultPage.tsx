'use client';

import VideoConsult, { SocketProvider, VideoCallProvider } from "@/components/function/VideoConsult";

export default function ConsultPage() {

    return ( 
        <SocketProvider>
            <VideoCallProvider>
                <VideoConsult/>
            </VideoCallProvider>
        </SocketProvider>
    );
}