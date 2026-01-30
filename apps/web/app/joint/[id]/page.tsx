import JointClient from './JointClient';

export default function JointRoomPage({ params }: { params: { id: string } }) {
  return <JointClient id={params.id} />;
}
