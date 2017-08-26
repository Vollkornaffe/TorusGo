module GameLogic where

import Prelude
import Data.Maybe (Maybe (Nothing, Just), fromJust)
import Data.Tuple (Tuple (Tuple), fst, snd)
import Data.Array (range, (!!), concatMap, snoc, updateAt, filter, length, fromFoldable, nub)
import Data.String (fromCharArray)
import Partial.Unsafe (unsafePartial)
import Data.Set as Set

data Color = Black | White
type Position = Tuple Int Int
type Size = Tuple Int Int
type Field = Maybe Color

type Board = Array Field

data Move = Pass | Play Position Field

newtype State = State { board :: Board, size :: Size, moveNum :: Int, curCol :: Color }

derive instance eqColor :: Eq Color

init :: Size -> State
init (Tuple w h) = 
    let newBoard = map (\_ -> Nothing) (range 0 (w*h-1))
    in State {
        board: newBoard,
        size: Tuple w h, 
        moveNum: 0,
        curCol: Black
    }

fromInts :: Size -> Array Int -> State
fromInts size as =
    let board = map field as
    in State {
        board: board,
        size: size,
        moveNum: 0,
        curCol: Black
    }
    where field i = case i of
            1 -> Just Black
            2 -> Just White
            _ -> Nothing

canonPos :: Size -> Position -> Int
canonPos (Tuple w h) (Tuple x y) =
    let x_mod = mod x w
        y_mod = mod y h
        x_mod_abs = if x_mod >= 0 then x_mod else w + x_mod
        y_mod_abs = if y_mod >= 0 then y_mod else w + y_mod
    in x_mod_abs + w * y_mod_abs

getField :: State -> Position -> Field
getField (State s) p = 
    let idx = canonPos s.size p
    in unsafePartial (fromJust (s.board !! idx))

setField :: State -> Field -> Position -> State
setField (State s) field p = 
    let idx = canonPos s.size p
        board' = unsafePartial (fromJust (updateAt idx field s.board))
    in State (s { board = board' })

neighPos :: Position -> Array Position
neighPos (Tuple x y) = 
    [ Tuple x (y+1),
      Tuple (x+1) y,
      Tuple x (y-1),
      Tuple (x-1) y ]

neighFields :: State -> Position -> Array Field
neighFields state p = map (getField state) (neighPos p)

neighFriends :: State -> Position -> Array Position
neighFriends s p = 
    case getField s p of
        Nothing -> []
        Just color -> filter (\n -> getField s n == Just color) (neighPos p)

group :: State -> Position -> Array Position
group s p =
    case getField s p of
        Nothing -> []
        Just color -> fromFoldable (step (Set.singleton p) (Set.singleton p))
    where
        step mem newMem =
            let newMemArray   = fromFoldable newMem
                newNeighArray = concatMap (neighFriends s) newMemArray
                newNeighSet   = Set.fromFoldable newNeighArray
                newMem'       = Set.difference newNeighSet mem
                mem'          = Set.union mem newMem'
            in if Set.isEmpty newMem'
                then mem
                else step mem' newMem'

toString :: State -> String
toString state@(State s) = 
    let field Nothing = 'O'
        field (Just Black) = 'X'
        field (Just White) = 'Y'
        row y = map (\x -> field (getField state (Tuple x y))) (range 0 ((fst s.size)-1))
    in fromCharArray (concatMap (\y -> snoc (row y) '\n') (range 0 ((snd s.size)-1)))

flipColor :: Color -> Color
flipColor Black = White
flipColor White = Black

freeNeighPos :: State -> Position -> Array Position
freeNeighPos s p = filter (\p' -> getField s p' == Nothing) (neighPos p)

directLiberties :: State -> Position -> Int
directLiberties s p = length ((filter ((==) Nothing)) (neighFields s p))

liberties :: State -> Position -> Maybe Int
liberties s p =
    case getField s p of 
        Nothing -> Nothing
        Just color -> (Just <<< length <<< nub <<< concatMap (freeNeighPos s)) (group s p)

makeMove :: State -> Move -> Maybe State
makeMove (State s) Pass = Just (State s { moveNum = s.moveNum + 1, curCol = flipColor s.curCol })
makeMove state (Play p f) = makeMove (setField state f p) Pass
