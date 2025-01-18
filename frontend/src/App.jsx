import { React, useState , useEffect } from "react";
import io from "socket.io-client";
import "./App.css";
import Editor from "@monaco-editor/react";

const socket = io("https://online-colab.onrender.com");
const App = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("//start code here");
  const [copySuccess , setCopySuccess] = useState("");
  const [users,setUsers] = useState([]);
  const [typing , setTyping] = useState("");
  const [output , setOutput] = useState("");
  const [version , setVersion] = useState("*");

  useEffect(()=>{
    socket.on("userJoined",(users)=>{
      setUsers(users);
    })

    socket.on("codeUpdate",(newCode)=>{
      setCode(newCode);
    })

    socket.on("userTyping",(user)=>{
      setTyping(`${user.slice(0,8)} is typing....`);
      setTimeout(()=>setTyping(""),3000); 
    })

    socket.on("languageUpdate",(newLanguage)=>{
      setLanguage(newLanguage);
      if(newLanguage == 'python'){
        setCode("# start code here");
      }
      else{
        setCode("// start code here");
      }
    })
    socket.on("codeResponse",(response)=>{
      setOutput(response.run.output);
    })

    return ()=>{
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
    }
  },[])

  useEffect(()=>{
    const handleBeforeUnload = () =>{
      socket.emit("leaveRoom");
    }
    window.addEventListener("beforeunload",handleBeforeUnload);
    return ()=>{
      window.removeEventListener("beforeunload",handleBeforeUnload);
    }
  },[])

  const joinRoom = () => {
    if (roomId && userName) {
      socket.emit("join", { roomId, userName });
      setJoined(true);
    }
  };

  const leaveRoom = () =>{
    socket.emit("leaveRoom");
    setRoomId("");
    setUserName("");
    setLanguage("javascript");
    setCode("// start code here");
    setJoined(false);
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""),3000);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", {roomId,userName});
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    setCode(newLanguage === "python" ? "# start code here" : "// start code here");
    socket.emit("languageChange",{roomId,language:newLanguage});
  }

  const runCode = () =>{
    socket.emit("compileCode",{code,roomId,language,version});
  }

  if (!joined) {
    return (
      <div className="join-container">
        <div className="join-form">
          <h2>Join Code Room</h2>
          <input
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <input
            type="text"
            placeholder="User Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <br />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      </div>
    );
  }
  return (
    <div className="editor-container">
      <div className="sidebar">
        <div className="room-info">
          <h5>Code Room:{roomId}</h5>
          <button onClick={copyRoomId} className="copy-button">
            Copy Id
          </button>
          {copySuccess && <span className="copy-success">{copySuccess}</span>}
        </div>
        <h3>Users in Room:</h3>
        <ul>
          {
            users.map((user,index)=>(
              <li key={index}>{user.slice(0,8)}....</li>
            ))
          }
        </ul>
        <p className="typing-indicator">{typing}</p>
        <select 
          className="language-selector"
          value = {language}
          onChange = {handleLanguageChange}
        >
          <option value="javascript">Javascript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        <button className="leave-button" onClick={leaveRoom}>Leave Room</button>
      </div>

      <div className="editor-wrapper">
        <Editor
          height={"61%"}
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 9,
            fontFamily: "Fira Code",
          }}
        />
        <button className="run-btn" onClick={runCode}> RUN CODE</button>
        <textarea className="output-console" value={output} readOnly 
        placeholder="Output will appear here ...." />
      </div>
    </div>
  );
};

export default App;
