// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Messenger {
    
    struct Message {
        uint id;
        address sender;
        string message;
    }
    
    mapping(uint => Message) public messages;
    uint messageIdCounter;
    
    event NewMessage(uint indexed _id, address indexed _sender, string _message);
    
    function sendMessage(string memory _message) public {

        messages[messageIdCounter] = Message(
            messageIdCounter,
            msg.sender,
            _message
        );

        messageIdCounter++;
        
        emit NewMessage(messageIdCounter, msg.sender, _message);
    }

    function getMessageList() public view returns (Message[] memory){
        Message[] memory msgList = new Message[](messageIdCounter);
        for (uint i = 0; i < messageIdCounter; i++) {
            Message storage message = messages[i];
            msgList[i] = message;
        }
        return msgList;
    }

    function getMessageById(uint msgId) external view returns (Message memory) {
        return messages[msgId];
    }

    function getNumberOfMessages() external view returns (uint) {
        return messageIdCounter;
    }
 
}