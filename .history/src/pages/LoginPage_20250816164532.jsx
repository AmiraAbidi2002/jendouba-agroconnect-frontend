export default function LoginPage(){
    return(
        <div className="p-10 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form>
                <input type="email" placeholder="Email" className="w-full p-2 mb-2 border rounded"/>
                <input type="password" placeholder="Password" className="w-full p-2 mb-2 border rounded"/>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
            </form>
        </div>
    );
}

