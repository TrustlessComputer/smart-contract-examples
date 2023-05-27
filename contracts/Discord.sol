// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Discord {

    struct Server {        
        address creator;
        string serverName;
    }
    
    mapping(string => Server) public servers;
    mapping(address => mapping(string => uint8)) public joinInfo;

    struct Channel {        
        address creator;
        string serverName;
        string channelName;
    }
    
    mapping(string => Channel) public channels;


    struct Message {        
        address sender;
        string message;        
    }

    mapping(string => mapping(string => Message[])) public messages;

    function createServer(string memory _sname) public {        

        require(keccak256(abi.encodePacked(servers[_sname].serverName)) == keccak256(abi.encodePacked("")), "The server name is existed already");
        servers[_sname] = Server(            
            msg.sender,
            _sname
        );
    }

    function joinServer(string memory _sname) public {

        require(keccak256(abi.encodePacked(_sname)) != keccak256(abi.encodePacked("")), "Server name must be not empty");
        require(keccak256(abi.encodePacked(servers[_sname].serverName)) != keccak256(abi.encodePacked("")), "The server name is not existed yet");
        require(joinInfo[msg.sender][_sname] == 0, "You have joined the server already");

        joinInfo[msg.sender][_sname] = 1;
    }

    function createChannel(string memory _sname, string memory _cname) public {

        require(keccak256(abi.encodePacked(_sname)) != keccak256(abi.encodePacked("")), "Server name must be not empty");
        require(keccak256(abi.encodePacked(_cname)) != keccak256(abi.encodePacked("")), "Channel name must be not empty");
        require(keccak256(abi.encodePacked(servers[_sname].serverName)) != keccak256(abi.encodePacked("")), "The server name is not existed yet");        

        channels[_cname] = Channel(            
            msg.sender,
            servers[_sname].serverName,
            _cname
        );
    }

    function postMessage(string memory _sname, string memory _cname, string memory _message) public {

        require(joinInfo[msg.sender][_sname] != 0, "You have not joined the server");
        require(keccak256(abi.encodePacked(channels[_cname].channelName)) != keccak256(abi.encodePacked("")), "The channel is not existed yet");        
        
        Message memory newMsg = Message(            
            msg.sender,
            _message
        );

        messages[_sname][_cname].push(newMsg);        
    }

    function getMessages(string memory _sname, string memory _cname) public view returns (string memory, string memory, Message[] memory) {
        return (_sname, _cname, messages[_sname][_cname]);
    }
}