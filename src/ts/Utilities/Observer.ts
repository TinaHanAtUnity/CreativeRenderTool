interface Observer {
    trigger(id: string, ...parameters);
}

export = Observer;