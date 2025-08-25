export default function RegisterPAge(){
    return (
        <div className="p-10 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Register</h2>
            <form>
                <Input type="text" placeholder="Name" className="w-full p-2 mb-2 border rounded"/>
                <Input type="email" placeholder="Email" className="w-full p-2 mb-2 border rounded"/>
                <Input type="password" placeholder="Password" className="w-full p-2 mb-2 border rounded"/>
                <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">Register</button>
            </form>
        </div>
    );
}
