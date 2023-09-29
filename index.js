#!/usr/bin/env node 

import chalk from 'chalk'
import inquirer from 'inquirer'
import gradient from 'gradient-string'
import chalkAnimation from 'chalk-animation'
import figlet from 'figlet'
import { createSpinner } from 'nanospinner'
import axios from 'axios'

//Variables
const customized_title = chalk.green.bgWhite('Pokemon War')
const title = 'Pokemon War'
const virtualName = 'Computer'
let playerHp = 300
let ComputerHp = 300
let playerName
let pokemons = [{
  name: '',
  url: ''
}]
let playerPokemon = {
  name: '',
  url: ''
}
let computerPokemon = {
  name: '',
  url: ''
}
let playerMoves = [{
  name: '',
  url : ''
}]
let computerMoves = [{
  name: '',
  url : ''
}]
let playerMove = {
  name: '',
  url: '',
  accuracy: 0,
  power: 0,
  pp: 0
}
let computerMove = {
  name: '',
  url: '',
  accuracy: 0,
  power: 0,
  pp: 0
}
//p for player and c for computer
let whooseTurn = 'p'
//title decoration
figlet(title, function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(data);
  });

//delay
const delay = (ms = 3000) => new Promise((r) => setTimeout(r,ms))
//how to play
const howToPlay = async ()=>{
    await delay()
    console.log(`
    ${chalk.bgBlue('how to play')}
    first : enter ur player name.
    second : choose ur ${chalk.bgRed('pokemon.')}
    third : select ur move.
    fourth : enjoy !.
    `)
    getPokemons()
}
//get player name
const getPlayerName = async () => {
  await delay()
  const answer = inquirer.prompt({
    name: 'player_name',
    type: 'input',
    message: 'What is ur name?',
    default(){
      return 'Player zero'
    },
    
  }).then((answer) => {
    playerName = answer.player_name;
    
    chooseUrPokemon()
  })
}
//choose a pokemon
const chooseUrPokemon = async () => {
      const answer = inquirer.prompt({
        name: 'pokemon',
        type: 'list',
        message: 'choose ur pokemon : ',
        choices: pokemons.map(obj => obj.name)
      }).then((answer) => {
        playerPokemon = pokemons.filter( obj => obj.name === answer.pokemon)[0]
        computerPokemon = pokemons.filter(obj => obj.name !== answer.pokemon)[0]
        
        getPokemonMoves()
        
      })
      
}

//get pokemons infos
const getPokemons = async ()=>{
  await axios.get(' https://pokeapi.co/api/v2/pokemon/')
  .then(response => {
    // Handle successful response
    let num = Math.floor(Math.random() * (response.data.results.length + 1)); 
    num < 15 ? num : num=0 
    pokemons = response.data.results.slice(num, num+5);
    
  })
  .catch(error => {
    // Handle error
    console.error('Error:', error);
  });
}

const displayGameBoard = async ()=>{
  const customSpace = '\t'.repeat(10)
  const begginSpace = ' '.repeat(15)
  console.log(`
  ${begginSpace}${playerName}${'\t'.repeat(10)}${virtualName}
  Monster name : ${playerPokemon.name}${'\t'.repeat(9)}${computerPokemon.name}
  `)
}

const getPokemonMoves = async ()=>{
  const request1 = axios.get(`${playerPokemon.url}`);
  const request2 = axios.get(`${computerPokemon.url}`);

  //handling conequerer requests - wait for all
  await axios.all([request1, request2])
    .then(axios.spread((response1, response2) => {
      let num = Math.floor(Math.random() * (response1.data.moves.length + 1)); 
      num < response1.data.moves.length - 5 ? num : num=0 
      playerMoves = response1.data.moves.slice(num, num+5).map(obj => obj.move);

      num = Math.floor(Math.random() * (response2.data.moves.length + 1)); 
      num < response2.data.moves.length - 5 ? num : num=0 
      computerMoves = response2.data.moves.slice(num, num+5).map(obj => obj.move);


      chooseUrMove()
    }))
    .catch(error => {
      console.error('Error:', error);
    });
}

//choose movement
const chooseUrMove = async () => {
  const answer = inquirer.prompt({
    name: 'move',
    type: 'list',
    message: 'choose ur move : ',
    choices: playerMoves.map(obj => obj.name)
  }).then((answer) => {
    playerMove = playerMoves.filter( obj => obj.name === answer.move)[0]
    //choose computer move randomly
    let num = Math.floor(Math.random() * (5)); 
    num < 5 ? num : num=0 
    computerMove = computerMoves[num]
    getMoveInfos()
  })
}

//get move infos for chosen moves
const getMoveInfos = async () => {

  await axios.get(`${playerMove.url}`)
  .then(response1 => {
    // Handle response1
    playerMove.accuracy = response1.data.accuracy || 0
    playerMove.power = response1.data.power || 0
    playerMove.pp = response1.data.pp || 0
    return  axios.get(`${computerMove.url}`)
  })
  .then(response2 => {
    // Handle response2
    computerMove.accuracy = response2.data.accuracy || 0
      computerMove.power = response2.data.power || 0
      computerMove.pp = response2.data.pp || 0
      handleFight()

  })
  .catch(error => {
    // Handle errors
    console.error('Error:', error);

  });
}

const handleFight = async () => {
  if( whooseTurn === 'p' ){
    if (playerMove.pp >= computerMove.pp){
      ComputerHp -= playerMove.power * (playerMove.accuracy/100)
      whooseTurn = 'c'
    }
  }else{
    if (playerMove.pp <= computerMove.pp){
      playerHp -= computerMove.power * (computerMove.accuracy/100)
      whooseTurn = 'p'
    }
  }
  

  verifyResult()
}

const verifyResult = async () => {
  playerHp = playerHp < 0 ? 0 : playerHp;
  ComputerHp = ComputerHp < 0 ? 0 : ComputerHp;

  console.log(`\nHP : ${playerHp}  ${ComputerHp}`)

  const spinner = createSpinner('Run verification').start()
  await delay()
  if( playerHp>0 && ComputerHp>0){
    chooseUrMove()
  }
  else if(playerHp === 0){
    spinner.error({text: '💀💀💀 Game Over 💀💀💀'})
    process.exit(1)
  }else if(ComputerHp === 0){
    spinner.success({text: '🎇🎇🎇You win !🎇🎇🎇'})
    process.exit(0)
  }
}

await howToPlay()
await getPlayerName()
