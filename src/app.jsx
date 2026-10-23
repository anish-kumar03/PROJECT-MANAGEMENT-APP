import { app } from "./firebase";

function App() {
    return (
        <main
            style={{
                fontFamily: "Arial, sans-serif",
                padding: "40px",
            }}
        >
            <h1>My First Firebase Project</h1>

            <p>
                React is successfully connected to the Firebase SDK.
            </p>

            <p>
                <strong>Project ID: </strong>
                {app.options.projectId}
            </p>
        </main>
    );
}

export default App;