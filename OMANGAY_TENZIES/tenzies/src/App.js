import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";
import "./styles/App.css";
import Dice from "./components/Dice";

function App() {
    const [dice, setDice] = useState(allNewDice());
    const [tenzies, setTenzies] = useState(false);
    const [numOfRolls, setNumOfRolls] = useState(0);

    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(false);

    const [bestTime, setBestTime] = useState(23450);

    useEffect(() => {
        const bestTime = JSON.parse(localStorage.getItem("bestTime"));
        if (bestTime) {
            setBestTime(bestTime);
        }
    }, []);
    useEffect(() => {
        let interval;
        if (running) {
            interval = setInterval(() => {
                setTime((prevTime) => prevTime + 10);
            }, 10);
        } else if (!running) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [running]);

    useEffect(() => {
        const allHeld = dice.every((die) => die.isHeld);

        const someHeld = dice.some((die) => die.isHeld);

        const firstValue = dice[0].value;
        const allSameValue = dice.every((die) => die.value === firstValue);

        if (someHeld) {
            setRunning(true);
        }

        if (allHeld && allSameValue) {
            setRunning(false);

            let currentTime = time;

            if (currentTime < bestTime) {
                setBestTime(currentTime);
                localStorage.setItem("bestTime", JSON.stringify(currentTime));
            }

            setTenzies(true);
        }
    }, [dice, time, bestTime]);

    function generateNewDice() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid(),
        };
    }

    function allNewDice() {
        const newDice = [];
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDice());
        }
        return newDice;
    }

    function rollDice() {
        if (!tenzies) {
            setNumOfRolls((prevState) => prevState + 1);
            setDice((oldDice) =>
                oldDice.map((dice) => {
                    return dice.isHeld ? dice : generateNewDice();
                })
            );
        } else {
            setTenzies(false);
            setDice(allNewDice());
            setNumOfRolls(0);
            setTime(0);
        }
    }

    function holdDice(id) {
        setDice((oldDice) =>
            oldDice.map((dice) => {
                return dice.id === id
                    ? { ...dice, isHeld: !dice.isHeld }
                    : dice;
            })
        );
    }

    const diceElements = dice.map((dice) => (
        <Dice
            key={dice.id}
            value={dice.value}
            isHeld={dice.isHeld}
            holdDice={() => holdDice(dice.id)}
        />
    ));

    return (
        <div className="App">
            <main>
                {tenzies && <Confetti />}
                <h1 className="title">Tenzies Game</h1>
                <p className="instructions">
                    <b>How to Play:</b> 
                    <br/>
                    Click on each dice to lock it and prevent it from rerolling when you click the roll button. <br/> The goal of this game is to get all the dice with the same number.
                </p>
                <h2 className="track-rolls">Total Number of Rolls: {numOfRolls}</h2>
                <div className="timer">
                    <div className="current-time">
                        <h3 className="current">Current</h3>
                        <div>
                            <span>
                                {("0" + Math.floor((time / 60000) % 60)).slice(
                                    -2
                                )}
                                :
                            </span>
                            <span>
                                {("0" + Math.floor((time / 1000) % 60)).slice(
                                    -2
                                )}
                                :
                            </span>
                            <span>{("0" + ((time / 10) % 100)).slice(-2)}</span>
                        </div>
                    </div>
                    <div className="best-time">
                        <h3 className="best">Best</h3>
                        <div>
                            <span>
                                {(
                                    "0" + Math.floor((bestTime / 60000) % 60)
                                ).slice(-2)}
                                :
                            </span>
                            <span>
                                {(
                                    "0" + Math.floor((bestTime / 1000) % 60)
                                ).slice(-2)}
                                :
                            </span>
                            <span>
                                {("0" + ((bestTime / 10) % 100)).slice(-2)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="dice-container">{diceElements}</div>
                <button className="roll-dice" onClick={rollDice}>
                    {tenzies ? "New Game" : "Roll"}
                </button>
            </main>
        </div>
    );
}

export default App;
